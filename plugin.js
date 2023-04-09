const plugin = {
  constants: {
    defaultSystemPrompt: "You are a helpful assistant.",
    pluginName: "Yappy",
  },

  insertText: {
    "lolz": async function(app) {
      return await this._contextAwarePrompt(app, "lolz");
    },
    "code": async function(app) {
      return await this._contextAwarePrompt(app, "code");
    },
    "complete": async function(app) {
      return await this._contextAwarePrompt(app, "complete");
    },
    "lookup": async function(app) {
      return await this._contextAwarePrompt(app, "lookup");
    },
    "sum": async function(app) {
      return await this._contextAwarePrompt(app, "sum");
    },
  },

  noteOption: {
    "revise": async function(app, noteUUID) {
      const instruction = await app.prompt("How should this note be revised?");
      if (!instruction) return;

      const note = await app.notes.find(noteUUID);
      const noteContent = await note.content();
      const result = await this._callOpenAI(app, "reviseContent", [ instruction, noteContent ]);
      const actionIndex = await app.alert(result, {
        actions: [ { icon: "post_add", label: "Insert in note" } ]
      });
      if (actionIndex === 0) {
        note.insertContent(result);
      }
    },
    "summarize": async function(app, noteUUID) {
      const note = await app.notes.find(noteUUID);
      const noteContent = await note.content();
      const result = await this._callOpenAI(app, "summarize", noteContent);
      const actionIndex = await app.alert(result, {
        actions: [ { icon: "post_add", label: "Insert in note" } ]
      });
      if (actionIndex === 0) {
        note.insertContent(result);
      }
    },
  },

  replaceText: {
    "complete": async function(app, text) {
      const result = await this._callOpenAI(app, "replaceTextComplete", text);
      return text + " " + result;
    },
    "revise": async function(app, text) {
      const instruction = await app.prompt("How should this text be revised?");
      if (!instruction) return null;

      const result = await this._callOpenAI(app, "reviseText", [ instruction, text ]);

      app.alert(result);

      return null;
    },
  },

  async _callOpenAI(app, promptType, promptContent) {
    let messages = [];
    const systemPrompt = this._systemPrompts[promptType] || this.constants.defaultSystemPrompt;
    messages.push({ role: "system", content: systemPrompt });
    const userPrompt = this._userPrompts[promptType] ? this._userPrompts[promptType](promptContent) : promptContent;
    if (Array.isArray(userPrompt)) {
      userPrompt.forEach(content => {
        messages.push({ role: "user", content: this._truncate(content) });
      });
    } else {
      messages.push({ role: "user", content: this._truncate(userPrompt) });
    }
    try {

      const modelSetting = app.settings["OpenAI model (default is gpt-3.5-turbo)"];
      const model = modelSetting && modelSetting.trim().length ? modelSetting.trim() : "gpt-3.5-turbo";
      console.log("Submitting messages", messages, "while using model", model);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ app.settings["API Key"] }`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages,
        })
      });
      const result = await response.json();
      const { choices: [ { message: { content } } ] } = result;
      return content;
    } catch (error) {
      app.alert("Failed to call OpenAI: " + error);
      return null;
    }
  },

  // GPT-3.5 has a 4097 token limit, so very much approximating that limit with this number
  _truncate(text, limit = 15000) {
    return text.length > limit ? text.slice(0, limit) : text;
  },

  async _contextAwarePrompt(app, promptEm) {
    const noteUUID = app.context.noteUUID;
    const note = await app.notes.find(noteUUID);
    const noteContent = await note.content();
    const tokenLabel = `{${ this.constants.pluginName }: ${ promptEm }}`;
    const specificityWords = [ "code", "complete", "lolz" ].includes(promptEm) ? "text" : "only the exact word or words";
    const tokenReplacePrompt = `Respond with ${ specificityWords } that could be used to replace the token <token> in the following input markdown document, which begins and ends with triple tildes:`;
    const prompt = this._tokenReplacePrompts[promptEm](tokenLabel);
    const appendMessage = "The resulting text should be grammatically correct and make sense in context. Do not explain how you derived your answer. Do not explain why you chose your answer. Do not respond with the token itself."
    if (noteContent.includes(tokenLabel)) {
      const messages = [ tokenReplacePrompt,
        prompt.length ? prompt : null,
        `~~~${ noteContent.replace(tokenLabel, "<token>") }~~~`,
        appendMessage ].filter(n => n);
      console.log("Composed messages for sending", messages);
      const result = await this._callOpenAI(app, promptEm, messages);
      return result;
    } else {
      app.alert("Couldn't find expected token in document")
      return null;
    }
  },

  _systemPrompts: {
    replaceTextComplete: "You are a helpful assistant helping continue writing markdown-formatted content.",
    reviseContent: "You are a helpful assistant that revises markdown-formatted content, as instructed.",
    reviseText: "You are a helpful assistant that revises text, as instructed.",
    summarize: "You are a helpful assistant that summarizes notes that are markdown-formatted.",
  },

  _tokenReplacePrompts: {
    code: () => `Provide a snippet of source code (in either Javascript, Python or Ruby) implementing
      the intent of the text preceding the token. Use the triple backtick to begin and end your code.`,
    complete: tokenLabel => ``,
    lolz: () => `Provide up to 100 words of entertaining, humorous content that is a little bit edgy. 
      Reference other text in the document provided to show how well you understand it, especially the text near the replace token. 
      If you can't figure out a funny joke, insert a four line limerick, song, poem, or rap that is relevant to the nearby text.`,
    lookup: () => "",
    sum: tokenLabel => `Calculate the sum of the table cells in the row or column of the token. 
      Respond only with plain text to be placed in the ${ tokenLabel } table cell. 
      If the summed cells contain a unit, include that unit in your response. The limit of your response is 20 characters.
      If you can not find numbers to sum, respond with "🤔"`,
  },

  _userPrompts: {
    replaceTextComplete: content => `Continue the following markdown-formatted content:\n\n${ content }`,
    reviseContent: ([ instruction, content ]) => [ instruction, content ],
    reviseText: ([ instruction, text ]) => [ instruction, text ],
    summarize: content => `Summarize the following markdown-formatted note:\n\n${ content }`,
  },
}