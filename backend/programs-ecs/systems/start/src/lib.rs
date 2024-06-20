use bolt_lang::*;
use game::Game;
use game::GameError;
use game::GameStatus;

declare_id!("2WJu82jnjZEYMKBJpo8B6b4JwN2yZfm7LDXzKihFW8FP");

#[system]
pub mod start {

    pub fn execute(ctx: Context<Components>, _args_p: Vec<u8>) -> Result<Components> {
        let game = &mut ctx.accounts.game;

        // Can only start the game when the game is not yet started
        if game.status != GameStatus::Lobby {
            return Err(GameError::StatusIsNotLobby.into());
        }

        // Check if all players are ready
        for player in &game.players {
            if !player.ready {
                return Err(GameError::PlayerIsNotPayer.into());
            }
        }

        let slot = Clock::get()?.slot;

        // Mark all players as ready to take action
        for player in &mut game.players {
            player.action_next_slot = slot;
        }

        // Mark the game as ready to tick
        game.growth_next_slot = slot;

        // Mark the game as started
        ctx.accounts.game.status = GameStatus::Playing;

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
    }
}
