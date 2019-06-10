import ace

class editor():
    """ace brython editor"""
    def __init__(self, script, editor_id, console_id, container_id, storage_id):
        self.script = script
        self.editor_id = editor_id
        self.console_id = console_id
        self.container_id = container_id
        self.storage_id = storage_id
        self.Ace = ace.Editor(editor_id=self.editor_id
                        , console_id=self.console_id
                        , container_id=self.container_id
                        , storage_id=self.storage_id)
    
    # 所有的 button 程式碼中, 選擇一個執行 setValue(), 可以顯示在對應 id 的程式編輯區
    def setValue(self):
        self.Ace.editor.setValue(self.script)

    def prog(self, ev):
        '''Ace = ace.Editor(editor_id="kw_editor"
                        , console_id="kw_console"
                        , container_id="kw__container"
                        , storage_id="kw_py_src" )
        '''
        '''
        Ace = ace.Editor(editor_id=self.editor_id
                        , console_id=self.console_id
                        , container_id=self.container_id
                        , storage_id=self.storage_id)
        '''
        self.Ace.editor.setValue(self.script)
        self.Ace.editor.scrollToRow(0)
        self.Ace.editor.gotoLine(0)
    
    def run(self, ev):
        self.Ace.run(ev)
        
    def show_console(self, ev):
        self.Ace.show_console(ev)
        
    def clear_console(self, ev):
        self.Ace.clear_console(ev)
        
    def clear_container(self, ev):
        self.Ace.clear_container(ev)