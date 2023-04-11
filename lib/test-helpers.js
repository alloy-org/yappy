import pluginObject from "./plugin"

export const mockPlugin = () => {
  const plugin = pluginObject;
  if (plugin.insertText) {
    Object.entries(plugin.insertText).forEach(([ key, fn ]) => {
      plugin.insertText[key] = plugin.insertText[key].bind(plugin); // .insertText
    });
  }
  if (plugin.noteOption) {
    Object.entries(plugin.noteOption).forEach(([ key, fn ]) => {
      plugin.noteOption[key] = plugin.noteOption[key].bind(plugin);
    });
  }

  if (plugin.replaceText) {
    Object.entries(plugin.replaceText).forEach(([ key, fn ]) => {
      plugin.replaceText[key] = plugin.replaceText[key].bind(plugin);
    });
  }

  return plugin;
}
