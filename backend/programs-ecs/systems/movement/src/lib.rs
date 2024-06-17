use bolt_lang::*;
use position::Position;

declare_id!("4UUQYvhcciKcU1hqLV6en4gFwH648FToeL2FvD2v3R6a");

#[system]
pub mod movement {

    pub fn execute(ctx: Context<Components>, _args_p: Vec<u8>) -> Result<Components> {
        let position = &mut ctx.accounts.position;
        position.x += 1;
        position.y += 1;
        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub position: Position,
    }

}
