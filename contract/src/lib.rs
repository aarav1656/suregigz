//! Escrow pattern implements locking functionality over some arbitrary storage
//! key.
//!
//! Upon locking something, it adds a flag in the store that some item on some
//! `id` is locked with some `state`. This allows you to verify if an item is
//! locked, and add some additional functionality to unlock the item.
//!
//! The crate exports a [derive macro](near_sdk_contract_tools_macros::Escrow)
//! that derives a default implementation for escrow.
//!
//! # Safety
//!
//! The state for this contract is stored under the
//! [`root`][EscrowInternal::root], make sure you don't accidentally collide
//! these storage entries in your contract. You can change the key this is
//! stored under by providing `storage_key` to the macro.
use near_sdk_contract_tools::{event, slot::Slot, DefaultStorageKey, standard::nep297::Event, Escrow, escrow};
use near_sdk_contract_tools::escrow::{Escrow as EscrowTrait, EscrowInternal as EscrowInternalTrait};
use near_sdk::{
    borsh::{BorshDeserialize, BorshSerialize},
    env::panic_str,
    require,
    serde::Serialize,
    BorshStorageKey,
    near, PanicOnDefault,
};

const ESCROW_ALREADY_LOCKED_MESSAGE: &str = "Already locked";
const ESCROW_NOT_LOCKED_MESSAGE: &str = "Lock required";
const ESCROW_UNLOCK_HANDLER_FAILED_MESSAGE: &str = "Unlock handler failed";

#[derive(BorshSerialize, BorshStorageKey)]
#[borsh(crate = "near_sdk::borsh")]
enum StorageKey<'a, T> {
    Locked(&'a T),
}

/// Emit the state of an escrow lock and whether it was locked or unlocked.
#[event(
    standard = "x-escrow",
    version = "1.0.0",
    crate = "near_sdk_contract_tools"
)]
pub struct Lock<Id: Serialize, State: Serialize> {
    /// The identifier for a lock.
    pub id: Id,
    /// If the lock was locked or unlocked, and any state along with it.
    pub locked: Option<State>,
}

/// Inner storage modifiers and functionality required for escrow to succeed.
pub trait EscrowInternal {
    /// Identifier over which the escrow exists.
    type Id: BorshSerialize;
    /// State stored inside the lock.
    type State: BorshSerialize + BorshDeserialize;

    /// Retrieve the state root.
    #[must_use]
    fn root() -> Slot<()> {
        Slot::root(DefaultStorageKey::Escrow)
    }

    /// Inner function to retrieve the slot keyed by its [`Id`](EscrowInternal::Id).
    fn locked_slot(&self, id: &Self::Id) -> Slot<Self::State> {
        Self::root().field(StorageKey::Locked(id))
    }

    /// Read the state from the slot.
    fn get_locked(&self, id: &Self::Id) -> Option<Self::State> {
        self.locked_slot(id).read()
    }

    /// Set the state at `id` to `locked`.
    fn set_locked(&mut self, id: &Self::Id, locked: &Self::State) {
        self.locked_slot(id).write(locked);
    }

    /// Clear the state at `id`.
    fn set_unlocked(&mut self, id: &Self::Id) {
        self.locked_slot(id).remove();
    }
}

/// Some escrowable capabilities, with a simple locking/unlocking mechanism.
///
/// If you add additional `Approve` capabilities here, you can make use of a
/// step-wise locking system.
pub trait Escrow {
    /// Identifier over which the escrow exists.
    type Id: BorshSerialize;
    /// State stored inside the lock.
    type State: BorshSerialize + BorshDeserialize;

    /// Lock some [`State`](Escrow::State) by its [`Id`](Escrow::Id) within the
    /// store.
    fn lock(&mut self, id: &Self::Id, state: &Self::State);

    /// Unlock and release some [`State`](Escrow::State) by its
    /// [`Id`](Escrow::Id).
    ///
    /// Optionally, you can provide a handler which would allow you to inject
    /// logic if you should unlock or not.
    fn unlock(&mut self, id: &Self::Id, unlock_handler: impl FnOnce(&Self::State) -> bool);

    /// Check if the item is locked
    fn is_locked(&self, id: &Self::Id) -> bool;
}

impl<T> Escrow for T
where
    T: EscrowInternal,
{
    type Id = <Self as EscrowInternal>::Id;
    type State = <Self as EscrowInternal>::State;

    fn lock(&mut self, id: &Self::Id, state: &Self::State) {
        require!(self.get_locked(id).is_none(), ESCROW_ALREADY_LOCKED_MESSAGE);

        self.set_locked(id, state);
    }

    fn unlock(&mut self, id: &Self::Id, unlock_handler: impl FnOnce(&Self::State) -> bool) {
        let lock = self
            .get_locked(id)
            .unwrap_or_else(|| panic_str(ESCROW_NOT_LOCKED_MESSAGE));

        if unlock_handler(&lock) {
            self.set_unlocked(id);
        } else {
            panic_str(ESCROW_UNLOCK_HANDLER_FAILED_MESSAGE)
        }
    }

    fn is_locked(&self, id: &Self::Id) -> bool {
        self.get_locked(id).is_some()
    }
}

/// A wrapper trait allowing all implementations of `State` and `Id` that
/// implement [`serde::Serialize`] to emit an event on success if they want to.
pub trait EventEmittedOnEscrow<Id: Serialize, State: Serialize> {
    /// Optionally implement an event on success of lock
    fn lock_emit(&mut self, id: &Id, state: &State);
    /// Optionally implement an event on success of unlock
    fn unlock_emit(&mut self, id: &Id, unlock_handler: impl FnOnce(&State) -> bool);
}

impl<T> EventEmittedOnEscrow<<T as Escrow>::Id, <T as Escrow>::State> for T
where
    T: Escrow + EscrowInternal,
    <T as Escrow>::Id: Serialize,
    <T as Escrow>::State: Serialize,
{
    fn lock_emit(&mut self, id: &<T as Escrow>::Id, state: &<T as Escrow>::State) {
        self.lock(id, state);
        Lock {
            id: id.to_owned(),
            locked: Some(state),
        }
        .emit();
    }

    fn unlock_emit(
        &mut self,
        id: &<T as Escrow>::Id,
        unlock_handler: impl FnOnce(&<T as Escrow>::State) -> bool,
    ) {
        self.unlock(id, unlock_handler);
        Lock::<_, <T as Escrow>::State> { id, locked: None }.emit();
    }
}

/// Main contract implementation
#[derive(Escrow, PanicOnDefault)]
#[escrow(id = "u64", state = "bool", crate = "crate")]
#[near(contract_state)]
pub struct SureGigzContract {}

#[near]
impl SureGigzContract {
    #[init]
    pub fn new() -> Self {
        Self {}
    }

    /// Lock a gig with the given ID and state
    pub fn lock_gig(&mut self, id: u64, state: bool) {
        self.lock(&id, &state);
        Lock {
            id,
            locked: Some(state),
        }
        .emit();
    }

    /// Unlock a gig with the given ID if the condition is met
    pub fn unlock_gig(&mut self, id: u64, condition: bool) {
        self.unlock(&id, |_state| condition);
        Lock::<u64, bool> { id, locked: None }.emit();
    }

    /// Check if a gig is locked
    pub fn is_gig_locked(&self, id: u64) -> bool {
        self.is_locked(&id)
    }

    /// Get the locked state of a gig
    pub fn get_gig_state(&self, id: u64) -> Option<bool> {
        self.get_locked(&id)
    }
}

#[cfg(test)]
mod tests {
    use super::Escrow;
    use crate::escrow::EscrowInternal;
    use near_sdk::{
        near, test_utils::VMContextBuilder, testing_env, AccountId, NearToken, PanicOnDefault,
        VMContext,
    };
    use near_sdk_contract_tools::Escrow;

    const ID: u64 = 1;
    const IS_NOT_READY: bool = false;
    const ONE_YOCTO: u128 = 1;

    #[derive(Escrow, PanicOnDefault)]
    #[escrow(id = "u64", state = "bool", crate = "crate")]
    #[near(contract_state)]
    struct Contract {}

    #[near]
    impl Contract {
        #[init]
        pub fn new() -> Self {
            Self {}
        }
    }

    fn alice() -> AccountId {
        "alice".parse().unwrap()
    }

    fn get_context(attached_deposit: u128, signer: Option<AccountId>) -> VMContext {
        VMContextBuilder::new()
            .signer_account_id(signer.clone().unwrap_or_else(alice))
            .predecessor_account_id(signer.unwrap_or_else(alice))
            .attached_deposit(NearToken::from_yoctonear(attached_deposit))
            .is_view(false)
            .build()
    }

    #[test]
    fn test_can_lock() {
        testing_env!(get_context(ONE_YOCTO, None));
        let mut contract = Contract::new();

        contract.lock(&ID, &IS_NOT_READY);
        assert!(contract.get_locked(&ID).is_some());
    }

    #[test]
    #[should_panic(expected = "Already locked")]
    fn test_cannot_lock_twice() {
        testing_env!(get_context(ONE_YOCTO, None));
        let mut contract = Contract::new();

        contract.lock(&ID, &IS_NOT_READY);
        contract.lock(&ID, &IS_NOT_READY);
    }

    #[test]
    fn test_can_unlock() {
        testing_env!(get_context(ONE_YOCTO, None));
        let mut contract = Contract::new();

        let is_ready = true;
        contract.lock(&ID, &is_ready);
        contract.unlock(&ID, |readiness| readiness == &is_ready);

        assert!(contract.get_locked(&ID).is_none());
    }

    #[test]
    #[should_panic(expected = "Unlock handler failed")]
    fn test_cannot_unlock_until_ready() {
        testing_env!(get_context(ONE_YOCTO, None));
        let mut contract = Contract::new();

        let is_ready = true;
        contract.lock(&ID, &IS_NOT_READY);
        contract.unlock(&ID, |readiness| readiness == &is_ready);

        assert!(contract.get_locked(&ID).is_none());
    }
}