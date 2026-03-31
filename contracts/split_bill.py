from beaker import *
from pyteal import *

class SplitChainApp(Application):

    # 🔹 Global State
    total_bills = GlobalStateValue(stack_type=TealType.uint64, default=Int(0))
    total_settled = GlobalStateValue(stack_type=TealType.uint64, default=Int(0))

    # 🔹 Local State (per user)
    amount_paid = LocalStateValue(stack_type=TealType.uint64, default=Int(0))

    # -------------------------------
    # 🚀 Create Bill
    # -------------------------------
    @external
    def create_bill(self, total_amount: abi.Uint64):
        return Seq(
            self.total_bills.increment(),
            Approve()
        )

    # -------------------------------
    # 👤 Opt-In to Bill
    # -------------------------------
    @external
    def opt_in_to_bill(self):
        return Seq(
            self.amount_paid.set(Int(0)),
            Approve()
        )

    # -------------------------------
    # 💸 Pay Share
    # -------------------------------
    @external
    def pay_share(self, payment: abi.PaymentTransaction):
        return Seq(
            # Ensure payment is sent
            Assert(payment.get().amount() > Int(0)),

            # Ensure payment receiver is app address
            Assert(payment.get().receiver() == Global.current_application_address()),

            # Update local state
            self.amount_paid.set(self.amount_paid.get() + payment.get().amount()),

            Approve()
        )

    # -------------------------------
    # ✅ Mark Bill Settled
    # -------------------------------
    @external
    def mark_settled(self):
        return Seq(
            self.total_settled.increment(),
            Approve()
        )


# 🔧 App Build
app = SplitChainApp()

if __name__ == "__main__":
    app.build().export("artifacts")
