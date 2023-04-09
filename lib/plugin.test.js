import { jest } from "@jest/globals"
import plugin from "./plugin"

// --------------------------------------------------------------------------------------
describe("plugin", () => {
  it("should have a name", () => {
    expect(plugin.constants.pluginName).toBe("Yappy");
  });

  it("should offer expression commands", () => {
    expect(plugin.insertText.lolz).toBeDefined();
    expect(plugin.insertText.code).toBeDefined();
    expect(plugin.insertText.complete).toBeDefined();
    expect(plugin.insertText.lookup).toBeDefined();
    expect(plugin.insertText.sum).toBeDefined();
  })

  it("should offer replace text options", () => {
    expect(plugin.replaceText.complete).toBeDefined();
    expect(plugin.replaceText.revise).toBeDefined();
    expect(plugin.replaceText.thesaurus).toBeDefined();
  });

  // --------------------------------------------------------------------------------------
  describe("with a mocked app", () => {
    const app = {};
    beforeEach(() => {
      app.alert = jest.fn();
      app.context = {};
      app.context.noteUUID = "abc123";
      app.prompt = jest.fn();
      app.notes = {};
      app.notes.find = jest.fn();
      app.settings = {};
      app.settings["API Key"] = "sk-1234567890";
    });

    it("should look up thesaurus entries", async () => {
      app.notes.find.mockReturnValue({
        content: () => "To be, or not to be, that is the query."
      });
      const result = await plugin.replaceText.thesaurus(app, "query");
      expect(result).toBe("question");
    });

    it("should evaluate the lookup expression", async () => {
      app.notes.find.mockReturnValue({
        content: () => `To be, or not to be, that is the {${ plugin.constants.pluginName }: lookup}.`
      });
      const result = await plugin.insertText.lookup(app);
      expect(result).toBe("question");
    });
  });
});
