import { get, set } from './domain'

describe("get target from object", () => {
    it("gets value from object location", () => {
        expect(get("level1.prop1").from({
            level1: {
                prop1: "expected value"
            }
        })).toBe("expected value");
    });

    it("get index from array", () => {
        expect(get("1").from([
            "not me",
            "you found me"
        ])).toBe("you found me");
    });

    it("get empty target string returns original", () => {
        expect(get("").from("expected")).toBe("expected");
    });

    it("returns undefined for non-existant target locations in object", () => {
        expect(get("somewhere.that.does.not.exist").from({})).toBe(undefined);
    })
});

describe("set value at target location of object to get next immutable progression", () => {
    it("sets the value at target location and keeps other refs", () => {
        const theObject = {
            level1Prop1: {
                level2Prop1: {
                    target: "original value"
                },
                level2Prop2: {}
            },
            level1Prop2: {}
        };

        const progession = set("level1Prop1.level2Prop1.target")
            .to("updated value")
            .in(theObject);

        expect(progession
            .level1Prop1
            .level2Prop1
            .target)
            .toBe("updated value");

        expect(progession.level1Prop2).toBe(theObject.level1Prop2);

        expect(progession.level1Prop1.level2Prop2).toBe(theObject.level1Prop1.level2Prop2);
    });

    it("can build an object by setting locations that dont exist", () => {
        expect(set("prop1.something.else").to("expected").in({})).toEqual({
            prop1: {
                something: {
                    else: "expected"
                }
            }
        });
    });
});
