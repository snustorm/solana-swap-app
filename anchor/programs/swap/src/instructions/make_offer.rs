use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    token_interface::{Mint, TokenAccount, TokenInterface}
};

use crate::state::Offer;

use super::transfer_tokens;

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct MakeOffer<'info>{
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(mint::token_program = token_program)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = payer,
        associated_token::token_program = token_program,
    )]
    pub maker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = payer,
        space = 8 + Offer::INIT_SPACE,
        seeds = [b"offer".as_ref(), payer.key().as_ref(), id.to_le_bytes().as_ref()],
        bump,
    )]
    pub offer: Account<'info, Offer>,

    
    #[account(
        init,
        payer = payer,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    
}

pub fn process_send_token_to_vault(
    ctx: &Context<MakeOffer>,
    token_a_offer_amount: u64
) -> Result<()> {

    //Transfer token from maker to vault
    transfer_tokens(
        &ctx.accounts.maker_token_account_a,
        &ctx.accounts.vault,
        &token_a_offer_amount,
        &ctx.accounts.token_mint_a,
        &ctx.accounts.payer,
        &ctx.accounts.token_program
    )
}

pub fn process_save_offer(
    ctx: Context<MakeOffer>, 
    id: u64,
    token_b_wanted_amount: u64,
    token_a_offered_amount: u64,
) -> Result<()> {

    let offer = &mut ctx.accounts.offer;
    offer.id = id;
    offer.maker = ctx.accounts.payer.key();
    offer.token_mint_a = ctx.accounts.token_mint_a.key();
    offer.token_mint_b = ctx.accounts.token_mint_b.key();
    offer.token_b_wanted_amount = token_b_wanted_amount;
    offer.token_a_offered_amount = token_a_offered_amount;
    offer.bump = ctx.bumps.offer;

    Ok(())
}