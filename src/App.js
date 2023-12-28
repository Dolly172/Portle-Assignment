import React, { useState, useEffect } from 'react';
import { Editor, EditorState, ContentState, convertFromRaw, convertToRaw, RichUtils, Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './App.css';

function App() {

  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      try {
        const contentState = convertFromRaw(JSON.parse(savedContent));
        return EditorState.createWithContent(contentState);
      } catch (error) {
        console.error('Error parsing saved content:', error);
      }
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem('editorContent', JSON.stringify(convertToRaw(contentState)));
  }, [editorState]);

  const handleEditorChange = (newState) => {
    setEditorState(newState);
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }

    return 'not-handled';
  };

  const onTab = (e) => {
    const maxDepth = 4;
    handleEditorChange(RichUtils.onTab(e, editorState, maxDepth));
  };

  const handleBeforeInput = (chars, editorState) => {
    const selectionState = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const startKey = selectionState.getStartKey();
    const currentBlock = currentContent.getBlockForKey(startKey);
    const text = currentBlock.getText();

    if (text === '#' && chars === ' ') {
      const newContentState = Modifier.applyInlineStyle(
        currentContent,
        selectionState.merge({
          anchorOffset: selectionState.getAnchorOffset() - 1,
          focusOffset: selectionState.getFocusOffset(),
        }),
        'BOLD_AND_LARGE'
      );

      handleEditorChange(EditorState.push(editorState, newContentState, 'apply-inline-style'));
      return 'handled';
    }

    if (chars === ' ') {
      const starCount = text.match(/\*{1,3}$/)[0].length;
  
      if (starCount === 1) {
        const newContentState = Modifier.applyInlineStyle(
          currentContent,
          selectionState.merge({
            anchorOffset: selectionState.getAnchorOffset() - 1,
            focusOffset: selectionState.getFocusOffset(),
          }),
          'BOLD'
        );
  
        handleEditorChange(EditorState.push(editorState, newContentState, 'apply-inline-style'));
        return 'handled';
      }
  
      if (starCount === 2) {
        const newContentState = Modifier.applyInlineStyle(
          currentContent,
          selectionState.merge({
            anchorOffset: selectionState.getAnchorOffset() - 2,
            focusOffset: selectionState.getFocusOffset(),
          }),
          'RED_FONT_COLOR'
        );
  
        handleEditorChange(EditorState.push(editorState, newContentState, 'apply-inline-style'));
        return 'handled';
      }
  
      if (starCount === 3) {
        const newContentState = Modifier.applyInlineStyle(
          currentContent,
          selectionState.merge({
            anchorOffset: selectionState.getAnchorOffset() - 3,
            focusOffset: selectionState.getFocusOffset(),
          }),
          'UNDERLINE'
        );
  
        handleEditorChange(EditorState.push(editorState, newContentState, 'apply-inline-style'));
        return 'handled';
      }
    }
  
    return 'not-handled';
  
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <button onClick={() => handleKeyCommand('save')}>Save</button>
      </div>
      <div className="editor-content">
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          onTab={onTab}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={{
            'RED_FONT_COLOR': { color: 'red' },
            'BOLD_AND_LARGE': {color: 'black', fontSize: 'xxx-large', fontWeight: 'bolder'},
            'BOLD': {fontWeight: 'bold', color: 'black'},
            'UNDERLINE': {textDecoration: 'underline', color: 'black'}
          }}
        />
      </div>
    </div>
  );
}

export default App;
