#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

mod instructions;
mod state;

pub use instructions::*;


declare_id!("2NBVSh6GCByp2gcPA1CnfjSPhuBK25kY32aEpqv9618u");

#[program]
pub mod swap {

    use super::*;

    pub fn make_offer(
        ctx: Context<MakeOffer>, 
        id: u64,
        token_a_offer_amount: u64,
        token_b_wanted_amount: u64
    ) -> Result<()> {
        
        //1. Maker Send Token A to Vault
        process_send_token_to_vault(&ctx, token_a_offer_amount)?;
        //1. Maker Create the Offer Account
        process_save_offer(ctx, id, token_b_wanted_amount, token_a_offer_amount)?;
        Ok(())
    }

    pub fn take_offer(
        ctx: Context<TakeOffer>,
    ) -> Result<()> {

        //1, Taker Send Token B to Directly to Maker
        process_send_wanted_token_to_maker(&ctx)?;

        //2. Taker Withdraw Token A from Vault and Close Vault
        process_withdraw_and_close_vault(ctx)?;
        Ok(())
    }
  
}

