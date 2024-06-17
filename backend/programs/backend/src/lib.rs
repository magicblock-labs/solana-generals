use anchor_lang::prelude::*;

declare_id!("GtS13ueiNME8RJd3rmrXgmc6TbCEPCMRLS2soknGR3Yf");

#[program]
pub mod backend {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
