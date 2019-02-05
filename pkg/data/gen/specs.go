package gen

import (
	"fmt"
	"sort"
	"time"

	"github.com/BurntSushi/toml"
)

type Spec struct {
	SeriesLimit  *int64
	Measurements []MeasurementSpec
}

func NewSeriesGeneratorFromSpec(s *Spec, tr TimeRange) SeriesGenerator {
	sg := make([]SeriesGenerator, len(s.Measurements))
	for i := range s.Measurements {
		sg[i] = newSeriesGeneratorFromMeasurementSpec(&s.Measurements[i], tr)
	}
	if s.SeriesLimit == nil {
		return NewMergedSeriesGenerator(sg)
	}
	return NewMergedSeriesGeneratorLimit(sg, *s.SeriesLimit)
}

type MeasurementSpec struct {
	Name            string
	SeriesLimit     *int64
	TagsSpec        *TagsSpec
	FieldValuesSpec *FieldValuesSpec
}

func newSeriesGeneratorFromMeasurementSpec(ms *MeasurementSpec, tr TimeRange) SeriesGenerator {
	if ms.SeriesLimit == nil {
		return NewSeriesGenerator(
			[]byte(ms.Name),
			[]byte(ms.FieldValuesSpec.Name),
			newTimeValuesSequenceFromFieldValuesSpec(ms.FieldValuesSpec, tr),
			newTagsSequenceFromTagsSpec(ms.TagsSpec))
	}
	return NewSeriesGeneratorLimit(
		[]byte(ms.Name),
		[]byte(ms.FieldValuesSpec.Name),
		newTimeValuesSequenceFromFieldValuesSpec(ms.FieldValuesSpec, tr),
		newTagsSequenceFromTagsSpec(ms.TagsSpec),
		*ms.SeriesLimit)
}

// NewTimeValuesSequenceFn returns a TimeValuesSequence that will generate a
// sequence of values based on the spec.
type NewTimeValuesSequenceFn func(spec TimeSequenceSpec) TimeValuesSequence

type NewTagsValuesSequenceFn func() TagsSequence

type NewCountableSequenceFn func() CountableSequence

type TagsSpec struct {
	Tags []*TagValuesSpec
}

func newTagsSequenceFromTagsSpec(ts *TagsSpec) TagsSequence {
	var keys []string
	var vals []CountableSequence
	for _, spec := range ts.Tags {
		keys = append(keys, spec.TagKey)
		vals = append(vals, spec.Values())
	}
	return NewTagsValuesSequenceKeysValues(keys, vals)
}

type TagValuesSpec struct {
	TagKey string
	Values NewCountableSequenceFn
}

type FieldValuesSpec struct {
	TimeSequenceSpec
	Name   string
	Values NewTimeValuesSequenceFn
}

func newTimeValuesSequenceFromFieldValuesSpec(fs *FieldValuesSpec, tr TimeRange) TimeValuesSequence {
	ts := fs.TimeSequenceSpec
	ts.Start = tr.Start
	ts.Delta = tr.End.Sub(tr.Start) / time.Duration(ts.Count)
	ts.Delta.Round(ts.Precision)

	return fs.Values(ts)
}

func NewSpecFromToml(s string) (*Spec, error) {
	var out Schema
	if _, err := toml.Decode(s, &out); err != nil {
		return nil, err
	}
	return NewSpecFromSchema(&out), nil
}

func NewSpecFromPath(path string) (*Spec, error) {
	var out Schema
	if _, err := toml.DecodeFile(path, &out); err != nil {
		return nil, err
	}
	return NewSpecFromSchema(&out), nil
}

func NewSchemaFromPath(path string) (*Schema, error) {
	var out Schema
	if _, err := toml.DecodeFile(path, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func NewSpecFromSchema(root *Schema) *Spec {
	var stack []interface{}
	push := func(v interface{}) {
		stack = append(stack, v)
	}
	pop := func() interface{} {
		tail := len(stack) - 1
		v := stack[tail]
		stack[tail] = nil
		stack = stack[:tail]
		return v
	}
	peek := func() interface{} {
		if len(stack) == 0 {
			return nil
		}
		return stack[len(stack)-1]
	}

	var spec Spec

	walkFn := func(node SchemaNode) bool {
		switch n := node.(type) {
		case *Schema:
			spec.Measurements = pop().([]MeasurementSpec)
			if n.SeriesLimit != nil {
				sl := int64(*n.SeriesLimit)
				spec.SeriesLimit = &sl
			}

		case Measurements:
			// flatten measurements
			var mss []MeasurementSpec
			for {
				if s, ok := peek().([]MeasurementSpec); ok {
					pop()
					mss = append(mss, s...)
					continue
				}
				break
			}
			sort.Slice(mss, func(i, j int) bool {
				return mss[i].Name < mss[j].Name
			})
			push(mss)

		case *Measurement:
			var ms []MeasurementSpec

			var seriesLimit *int64
			if n.SeriesLimit != nil {
				sl := int64(*n.SeriesLimit)
				seriesLimit = &sl
			}

			fields := pop().([]*FieldValuesSpec)
			tagsSpec := pop().(*TagsSpec)
			for _, spec := range fields {
				ms = append(ms, MeasurementSpec{
					Name:            n.Name,
					SeriesLimit:     seriesLimit,
					TagsSpec:        tagsSpec,
					FieldValuesSpec: spec,
				})
			}

			// NOTE: sort each measurement name + field name to ensure series are produced
			//  in correct order
			sort.Slice(ms, func(i, j int) bool {
				return ms[i].FieldValuesSpec.Name < ms[j].FieldValuesSpec.Name
			})
			push(ms)

		case Tags:
			var ts TagsSpec
			for {
				if s, ok := peek().(*TagValuesSpec); ok {
					pop()
					ts.Tags = append(ts.Tags, s)
					continue
				}
				break
			}
			// Tag keys must be sorted to produce a valid series key sequence
			sort.Slice(ts.Tags, func(i, j int) bool {
				return ts.Tags[i].TagKey < ts.Tags[j].TagKey
			})
			push(&ts)

		case Fields:
			// combine fields
			var i []*FieldValuesSpec
			for {
				if s, ok := peek().(*FieldValuesSpec); ok {
					pop()
					i = append(i, s)
					continue
				}
				break
			}
			push(i)

		case *Field:
			fn, ok := pop().(NewTimeValuesSequenceFn)
			if !ok {
				panic(fmt.Sprintf("unexpected type %T", fn))
			}

			// default to millisecond precision
			p := precisionMillisecond
			if n.TimePrecision != nil {
				p = *n.TimePrecision
			}

			push(&FieldValuesSpec{
				TimeSequenceSpec: TimeSequenceSpec{
					Count:     int(n.Count),
					Precision: p.ToDuration(),
				},
				Name:   n.Name,
				Values: fn,
			})

		case *FieldConstantValue:
			var f NewTimeValuesSequenceFn
			switch v := n.Value.(type) {
			case float64:
				f = func(spec TimeSequenceSpec) TimeValuesSequence {
					return NewTimeFloatValuesSequence(
						spec.Count,
						NewTimestampSequenceFromSpec(spec),
						NewFloatConstantValuesSequence(v),
					)
				}
			case int64:
				f = func(spec TimeSequenceSpec) TimeValuesSequence {
					return NewTimeIntegerValuesSequence(
						spec.Count,
						NewTimestampSequenceFromSpec(spec),
						NewIntegerConstantValuesSequence(v),
					)
				}
			case string:
				f = func(spec TimeSequenceSpec) TimeValuesSequence {
					return NewTimeStringValuesSequence(
						spec.Count,
						NewTimestampSequenceFromSpec(spec),
						NewStringConstantValuesSequence(v),
					)
				}
			case bool:
				f = func(spec TimeSequenceSpec) TimeValuesSequence {
					return NewTimeBooleanValuesSequence(
						spec.Count,
						NewTimestampSequenceFromSpec(spec),
						NewBooleanConstantValuesSequence(v),
					)
				}
			default:
				panic(fmt.Sprintf("unexpected type %T", v))
			}

			push(f)

		case *FieldArraySource:
			var f NewTimeValuesSequenceFn
			switch v := n.Value.(type) {
			case []float64:
				f = func(spec TimeSequenceSpec) TimeValuesSequence {
					return NewTimeFloatValuesSequence(
						spec.Count,
						NewTimestampSequenceFromSpec(spec),
						NewFloatArrayValuesSequence(v),
					)
				}
			case []int64:
				f = func(spec TimeSequenceSpec) TimeValuesSequence {
					return NewTimeIntegerValuesSequence(
						spec.Count,
						NewTimestampSequenceFromSpec(spec),
						NewIntegerArrayValuesSequence(v),
					)
				}
			case []string:
				f = func(spec TimeSequenceSpec) TimeValuesSequence {
					return NewTimeStringValuesSequence(
						spec.Count,
						NewTimestampSequenceFromSpec(spec),
						NewStringArrayValuesSequence(v),
					)
				}
			case []bool:
				f = func(spec TimeSequenceSpec) TimeValuesSequence {
					return NewTimeBooleanValuesSequence(
						spec.Count,
						NewTimestampSequenceFromSpec(spec),
						NewBooleanArrayValuesSequence(v),
					)
				}
			default:
				panic(fmt.Sprintf("unexpected type %T", v))

			}

			push(f)

		case *Tag:
			push(&TagValuesSpec{
				TagKey: n.Name,
				Values: pop().(NewCountableSequenceFn),
			})

		case *TagSequenceSource:
			push(NewCountableSequenceFn(func() CountableSequence {
				return NewCounterByteSequence(n.Format, int(n.Start), int(n.Start+n.Count))
			}))

		case *TagArraySource:
			push(NewCountableSequenceFn(func() CountableSequence {
				return NewStringArraySequence(n.Values)
			}))

		case nil:

		default:
			panic(fmt.Sprintf("unexpected type %T", node))
		}

		return true
	}

	WalkUp(VisitorFn(walkFn), root)

	return &spec
}
