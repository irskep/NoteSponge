// Define a struct to hold editor state
#[derive(Copy, Clone)]
pub struct EditorState {
    pub bold_active: bool,
    pub italic_active: bool,
    pub underline_active: bool,
    pub strikethrough_active: bool,
    pub code_active: bool,
    pub align_left_active: bool,
    pub align_center_active: bool,
    pub align_right_active: bool,
    pub align_justify_active: bool,
    pub bullet_list_active: bool,
    pub numbered_list_active: bool,
    pub can_undo: bool,
    pub can_redo: bool,
}

impl Default for EditorState {
    fn default() -> Self {
        Self {
            bold_active: false,
            italic_active: false,
            underline_active: false,
            strikethrough_active: false,
            code_active: false,
            align_left_active: true, // Default alignment is left
            align_center_active: false,
            align_right_active: false,
            align_justify_active: false,
            bullet_list_active: false,
            numbered_list_active: false,
            can_undo: false,
            can_redo: false,
        }
    }
} 