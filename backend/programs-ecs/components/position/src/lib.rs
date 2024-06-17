use bolt_lang::*;

declare_id!("FZtB8og6w4rPmTS79xquutmNdLLrkzGKYeXSsc6g5FMU");

#[component]
#[derive(Default)]
pub struct Position {
    pub x: i64,
    pub y: i64,
    pub z: i64,
    #[max_len(20)]
    pub description: String,
}
