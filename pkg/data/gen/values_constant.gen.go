// Generated by tmpl
// https://github.com/benbjohnson/tmpl
//
// DO NOT EDIT!
// Source: values_constant.gen.go.tmpl

package gen

type FloatConstantValuesSequence struct {
	v float64
}

func NewFloatConstantValuesSequence(v float64) *FloatConstantValuesSequence {
	return &FloatConstantValuesSequence{
		v: v,
	}
}

func (g *FloatConstantValuesSequence) Reset() {
}

func (g *FloatConstantValuesSequence) Write(vs []float64) {
	for i := 0; i < len(vs); i++ {
		vs[i] = g.v
	}
}

type IntegerConstantValuesSequence struct {
	v int64
}

func NewIntegerConstantValuesSequence(v int64) *IntegerConstantValuesSequence {
	return &IntegerConstantValuesSequence{
		v: v,
	}
}

func (g *IntegerConstantValuesSequence) Reset() {
}

func (g *IntegerConstantValuesSequence) Write(vs []int64) {
	for i := 0; i < len(vs); i++ {
		vs[i] = g.v
	}
}

type UnsignedConstantValuesSequence struct {
	v uint64
}

func NewUnsignedConstantValuesSequence(v uint64) *UnsignedConstantValuesSequence {
	return &UnsignedConstantValuesSequence{
		v: v,
	}
}

func (g *UnsignedConstantValuesSequence) Reset() {
}

func (g *UnsignedConstantValuesSequence) Write(vs []uint64) {
	for i := 0; i < len(vs); i++ {
		vs[i] = g.v
	}
}

type StringConstantValuesSequence struct {
	v string
}

func NewStringConstantValuesSequence(v string) *StringConstantValuesSequence {
	return &StringConstantValuesSequence{
		v: v,
	}
}

func (g *StringConstantValuesSequence) Reset() {
}

func (g *StringConstantValuesSequence) Write(vs []string) {
	for i := 0; i < len(vs); i++ {
		vs[i] = g.v
	}
}

type BooleanConstantValuesSequence struct {
	v bool
}

func NewBooleanConstantValuesSequence(v bool) *BooleanConstantValuesSequence {
	return &BooleanConstantValuesSequence{
		v: v,
	}
}

func (g *BooleanConstantValuesSequence) Reset() {
}

func (g *BooleanConstantValuesSequence) Write(vs []bool) {
	for i := 0; i < len(vs); i++ {
		vs[i] = g.v
	}
}
