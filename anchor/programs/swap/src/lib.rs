#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod swap {
    use super::*;

  pub fn close(_ctx: Context<CloseSwap>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.swap.count = ctx.accounts.swap.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.swap.count = ctx.accounts.swap.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeSwap>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.swap.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeSwap<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Swap::INIT_SPACE,
  payer = payer
  )]
  pub swap: Account<'info, Swap>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseSwap<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub swap: Account<'info, Swap>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub swap: Account<'info, Swap>,
}

#[account]
#[derive(InitSpace)]
pub struct Swap {
  count: u8,
}
