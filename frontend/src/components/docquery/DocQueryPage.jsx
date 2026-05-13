import DocQueryLayout from "./DocQueryLayout";
import { useDocQueryState } from "./useDocQueryState";

const DocQueryPage = () => {
  const state = useDocQueryState();

  return (
    <DocQueryLayout
      file={state.file}
      query={state.query}
      uploads={state.uploads}
      messages={state.messages}
      emptyStateMessages={state.emptyStateMessages}
      isChatWorkspace={state.isChatWorkspace}
      fileInputRef={state.fileInputRef}
      messagesEndRef={state.messagesEndRef}
      setFile={state.setFile}
      setQuery={state.setQuery}
      onNewChat={state.handleNewChat}
      onAttach={state.handleFileClick}
      onFileChange={state.handleFileChange}
      onSubmit={state.handleSubmit}
    />
  );
};

export default DocQueryPage;
