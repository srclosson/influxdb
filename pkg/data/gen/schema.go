package gen

import (
	"fmt"
)

type Visitor interface {
	Visit(node SchemaNode) (w Visitor)
}

type SchemaNode interface {
	node()
}

type Schema struct {
	Title        string
	Version      string
	SeriesLimit  *SeriesLimit `toml:"series-limit"`
	Measurements Measurements
}

func (*Schema) node() {}

type Measurements []Measurement

func (Measurements) node() {}

type Tags []Tag

func (Tags) node() {}

type Fields []Field

func (Fields) node() {}

type Measurement struct {
	Name        string
	SeriesLimit *SeriesLimit `toml:"series-limit"`
	Tags        Tags
	Fields      Fields
}

func (*Measurement) node() {}

type TagSource interface {
	fmt.Stringer
	SchemaNode
	tagsource()
}

type Tag struct {
	Name   string
	Source TagSource
}

func (*Tag) node() {}

type TagArraySource struct {
	Values []string
}

func (*TagArraySource) node()      {}
func (*TagArraySource) tagsource() {}

func (s *TagArraySource) String() string {
	return fmt.Sprintf("array, source=%#v", s.Values)
}

type TagSequenceSource struct {
	Format string
	Start  int64
	Count  int64
}

func (*TagSequenceSource) node()      {}
func (*TagSequenceSource) tagsource() {}

func (t *TagSequenceSource) String() string {
	return fmt.Sprintf("sequence, prefix=%q, range=[%d,%d)", t.Format, t.Start, t.Start+t.Count)
}

type FieldSource interface {
	fmt.Stringer
	SchemaNode
	fieldsource()
}

type Field struct {
	Name          string
	Count         int64
	TimePrecision *precision `toml:"time-precision"` // TimePrecision determines the precision for generated timestamp values
	Source        FieldSource
}

func (*Field) node() {}

type FieldConstantValue struct {
	Value interface{}
}

func (*FieldConstantValue) node()        {}
func (*FieldConstantValue) fieldsource() {}

func (f *FieldConstantValue) String() string {
	return fmt.Sprintf("constant, source=%#v", f.Value)
}

type FieldArraySource struct {
	Value interface{}
}

func (*FieldArraySource) node()        {}
func (*FieldArraySource) fieldsource() {}

func (f *FieldArraySource) String() string {
	return fmt.Sprintf("array, source=%#v", f.Value)
}

type VisitorFn func(node SchemaNode) bool

func (fn VisitorFn) Visit(node SchemaNode) (w Visitor) {
	if fn(node) {
		return fn
	}
	return nil
}

// WalkDown performs a pre-order, depth-first traversal of the graph, calling v for each node.
// Pre-order starts by calling the visitor for the root and each child as it traverses down
// the graph to the leaves.
func WalkDown(v Visitor, node SchemaNode) {
	walk(v, node, false)
}

// WalkUp performs a post-order, depth-first traversal of the graph, calling v for each node.
// Post-order starts by calling the visitor for the leaves then each parent as it traverses up
// the graph to the root.
func WalkUp(v Visitor, node SchemaNode) {
	walk(v, node, true)
}

func walk(v Visitor, node SchemaNode, up bool) {
	if !up {
		if v = v.Visit(node); v == nil {
			return
		}
	}

	switch n := node.(type) {
	case *Schema:
		walk(v, n.Measurements, up)

	case Measurements:
		for i := range n {
			walk(v, &n[i], up)
		}

	case *Measurement:
		walk(v, n.Tags, up)
		walk(v, n.Fields, up)

	case Fields:
		for i := 0; i < len(n); i++ {
			walk(v, &n[i], up)
		}

	case Tags:
		for i := 0; i < len(n); i++ {
			walk(v, &n[i], up)
		}

	case *Tag:
		walk(v, n.Source, up)

	case *TagArraySource, *TagSequenceSource:
		// nothing to do

	case *Field:
		walk(v, n.Source, up)

	case *FieldConstantValue, *FieldArraySource:
		// nothing to do

	default:
		panic(fmt.Sprintf("schema.Walk: unexpected node type %T", n))
	}

	if up {
		if v = v.Visit(node); v == nil {
			return
		}
	}
}
