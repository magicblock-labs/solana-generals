use bolt_lang::*;
use game::Game;
use game::GameCell;
use game::GameCellKind;
use game::GameCellOwner;
use game::GameError;
use game::GameStatus;

declare_id!("8tKAapRKPrNkxXwcArbSAnBHieYnX6M2WoTxukbCQtTa");

#[system]
pub mod tick {
    pub fn execute(ctx: Context<Components>, _args_p: Vec<u8>) -> Result<Components> {
        let game = &mut ctx.accounts.game;

        // Can only trigger commands when the game is playing
        if game.status != GameStatus::Playing {
            return Err(GameError::StatusIsNotPlaying.into());
        }

        // Check that the game tick cooldown has elapsed
        if Clock::get()?.slot >= game.tick_next_slot {
            game.tick_next_slot = game.tick_next_slot + 1;

            // Loop over all cell and increment its strength if someone is occupying
            for x in 0..game.size_x {
                for y in 0..game.size_y {
                    let mut cell = game.get_cell(x, y)?.clone();
                    if cell.owner == GameCellOwner::Nobody {
                        continue;
                    }
                    if game.tick_next_slot % 20 == 0 && cell.kind == GameCellKind::Capital {
                        cell.strength = cell.strength.saturating_add(1);
                    }
                    if game.tick_next_slot % 40 == 0 && cell.kind == GameCellKind::City {
                        cell.strength = cell.strength.saturating_add(1);
                    }
                    if game.tick_next_slot % 200 == 0 && cell.kind == GameCellKind::Field {
                        cell.strength = cell.strength.saturating_add(1);
                    }
                    game.set_cell(x, y, cell)?;
                }
            }
        }

        game.set_cell(0, 0, GameCell::city())?; // BLAH

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
    }
}
