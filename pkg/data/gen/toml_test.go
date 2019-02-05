package gen

import (
	"fmt"
	"strings"
	"testing"

	"github.com/BurntSushi/toml"
)

func visit(root *Schema) string {
	w := &strings.Builder{}

	walkFn := func(node SchemaNode) bool {
		switch n := node.(type) {
		case *Schema:

		case Measurements:
			fmt.Fprintln(w, "Measurements: ")

		case *Measurement:
			fmt.Fprintln(w)
			fmt.Fprintf(w, "  Name: %s\n", n.Name)

		case Tags:
			fmt.Fprintln(w, "  Tags:")

		case Fields:
			fmt.Fprintln(w, "  Fields:")

		case *Field:
			fmt.Fprintf(w, "    %s: %s, count=%d, time-precision=%s\n", n.Name, n.Source, n.Count, n.TimePrecision)

		case *Tag:
			fmt.Fprintf(w, "    %s: %s\n", n.Name, n.Source)

		}

		return true
	}

	WalkDown(VisitorFn(walkFn), root)

	return w.String()
}

func TestSchema(t *testing.T) {
	in := `
title = "example schema"
series-limit = 10

[[measurements]]
    name = "m0"
	series-limit = 5

    [[measurements.tags]]
        name   = "tag0"
        source = [ "host1", "host2" ]

    [[measurements.tags]]
        name   = "tag1"
        source = [ "process1", "process2" ]

    [[measurements.tags]]
        name   = "tag2"
        source = { type = "sequence", format = "value%s", start = 0, count = 100 }

    [[measurements.fields]]
        name   = "f0"
        count  = 5000
        source = 0.5

`
	var out Schema
	_, err := toml.Decode(in, &out)
	if err != nil {
		t.Fatalf("unxpected error: %v", err)
	}

	res := visit(&out)
	t.Log(res)

	in = `
title = "example schema"

[[measurements]]
name = "m0"
tags = [
	{ name = "tag0", source = [ "host1", "host2" ] },
	{ name = "tag1", source = [ "process1", "process2" ] },
	{ name = "tag2", source = { type = "sequence", format = "value%s", start = 0, count = 100 } }
]
fields = [
	{ name = "f0", count = 5000, source = 0.5 },
	{ name = "f1", count = 5000, source = [true, false, true, true] },
]
[[measurements]]
name = "m1"
tags = [
	{ name = "tag0", source = [ "host1", "host2" ] },
]
fields = [
	{ name = "f0", count = 5000, source = ["some string", "foo"] },
]
`
	_, err = toml.Decode(in, &out)
	if err != nil {
		t.Fatalf("unxpected error: %v", err)
	}

	res = visit(&out)
	t.Log(res)
}
