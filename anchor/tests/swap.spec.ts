import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Swap} from '../target/types/swap'

describe('swap', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Swap as Program<Swap>

  const swapKeypair = Keypair.generate()

  it('Initialize Swap', async () => {
    await program.methods
      .initialize()
      .accounts({
        swap: swapKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([swapKeypair])
      .rpc()

    const currentCount = await program.account.swap.fetch(swapKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Swap', async () => {
    await program.methods.increment().accounts({ swap: swapKeypair.publicKey }).rpc()

    const currentCount = await program.account.swap.fetch(swapKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Swap Again', async () => {
    await program.methods.increment().accounts({ swap: swapKeypair.publicKey }).rpc()

    const currentCount = await program.account.swap.fetch(swapKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Swap', async () => {
    await program.methods.decrement().accounts({ swap: swapKeypair.publicKey }).rpc()

    const currentCount = await program.account.swap.fetch(swapKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set swap value', async () => {
    await program.methods.set(42).accounts({ swap: swapKeypair.publicKey }).rpc()

    const currentCount = await program.account.swap.fetch(swapKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the swap account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        swap: swapKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.swap.fetchNullable(swapKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
