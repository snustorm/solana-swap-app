use anchor_lang::prelude::*;


#[account]
#[derive(InitSpace)]
pub struct Offer {
    pub id: u64,
    pub maker: Pubkey,
    pub token_mint_a: Pubkey,
    pub token_mint_b: Pubkey,
    pub token_b_wanted_amount: u64,
    pub token_a_offered_amount: u64,
    pub bump: u8,
}
