const plugin = require("./plugin.js");

describe("plugin", () => {
  it("should have a name", () => {
    expect(plugin.constants.pluginName).toBe("Yappy");
  });
});
