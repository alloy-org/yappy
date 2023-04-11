import { mockPlugin, mockApp } from "./test-helpers.js"

// --------------------------------------------------------------------------------------
// Note that some of these tests actually make calls to OpenAI. Normally tests would be mocked for
// a remote call, but for Bill's current purposes, it's pretty useful to be able to see what the real
// API responds with as I iterate upon new possible methods
describe("plugin", () => {
  const plugin = mockPlugin();

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
    const app = mockApp();

    it("should look up thesaurus entries", async () => {
      app.notes.find.mockReturnValue({
        content: () => "To be, or not to be, that is the query."
      });
      const result = await plugin.replaceText.thesaurus(app, "query");
      expect(result).toContain("question");
    });

    it("should evaluate the lookup expression", async () => {
      app.notes.find.mockReturnValue({
        content: () => `To be, or not to be, that is the {${ plugin.constants.pluginName }: lookup}.`
      });
      const result = await plugin.insertText.lookup(app);
      expect(result).toBe("question.");
    });
  });
});
