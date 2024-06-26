use bolt_lang::*;
use game::Game;
use game::GameCell;
use game::GameError;
use game::GameStatus;

declare_id!("CqZi8eYYnTp1C58rfZVw8fxr2YZ1yUi3TcTz3zjj7NAu");

#[system]
pub mod generate {

    pub fn execute(ctx: Context<Components>, _args: Args) -> Result<Components> {
        let game = &mut ctx.accounts.game;

        // Can only generate the game when it has just been initialized
        if game.status != GameStatus::Generate {
            return Err(GameError::StatusIsNotGenerate.into());
        }

        // Generate a dummy map, could have multiple generation options later
        game.size_x = 16;
        game.size_y = 8;

        // Whole map is just fields for now
        for x in 0..game.size_x {
            for y in 0..game.size_y {
                game.set_cell(x, y, GameCell::field())?
            }
        }

        // Add cities in the corners
        game.set_cell(2, 5, GameCell::city())?;
        game.set_cell(13, 2, GameCell::city())?;

        // Add cities in the center
        game.set_cell(7, 3, GameCell::city())?;
        game.set_cell(8, 4, GameCell::city())?;

        // Players capitals in the corners
        game.set_cell(1, 1, GameCell::capital(0))?;
        game.set_cell(14, 6, GameCell::capital(1))?;

        // When done, mark the game as ready to receive players
        ctx.accounts.game.status = GameStatus::Lobby;

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
    }

    #[arguments]
    struct Args {}
}
