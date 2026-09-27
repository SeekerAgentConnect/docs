---
title: Paid membership for your signals
description: "Sell membership in your own system. A Restricted feed admits the wallets you say are members, and drops them when they are not."
slug: /recipe-paid-membership
sidebar_position: 2
---

**Use case.** You run a paid trading-signal community, an invite-only analyst group, or a service where a subscription unlocks a feed. You already sell the membership. A [Restricted feed](/docs/restricted-feeds) lets the phone prove which wallet a subscriber controls, and a small rule on your server asks your own records whether that wallet is a member. Members are approved on the spot; non-members are rejected; people who stop paying are revoked.

| | |
| --- | --- |
| **Integration mode** | Feed, **Restricted** access policy |
| **Starting point** | The [Copy trading](/docs/recipe-copytrading) setup, with its manual approval replaced by your rule |
| **Access decisions** | Automatic, from your own membership records, through the Go publisher library's `access` package |
| **Billing** | Entirely yours. SAC provides none |

## Prerequisites {#prerequisites}

- A Restricted feed running on the publisher library, such as the [Copy trading](/docs/recipe-copytrading) demo.
- Your own membership system: pricing, checkout, billing, and a way to ask whether a wallet is an active member.
- Go, to build the rule into your server.

## Who does what {#who-does-what}

| You (the provider) | Seeker Agent Connect |
| --- | --- |
| Pricing, checkout, billing, renewals, refunds | Proves which wallet a subscriber controls |
| Your membership database, and which wallet each membership belongs to | Delivers each signal only to devices you approved |
| The eligibility rule that reads that database | Asks your rule at request, redemption and renewal |
| Webhooks from your billing provider, if you use one | Enforces revocations at the gateway |

SAC has **no built-in payments, checkout, recurring billing, or billing-provider integration**. Nothing on this page charges anyone. It shows how to connect a membership you already manage to the access decisions SAC enforces.

Access is decided per **wallet** and enforced per approved **installation**: each phone that proves a member's wallet is its own device. Every member receives the same publication; a feed is not personalised per recipient, and nothing trades automatically.

## Step 1: Tie each membership to a wallet {#tie-membership-to-wallet}

At checkout, or in your member area, collect the Solana wallet address the member will use in SAC and store it against their membership. That address is the only identity SAC gives your rule. How you collect and verify it is up to your own system.

## Step 2: Set up the Restricted feed {#set-up-the-feed}

Follow [Run a Restricted feed](/docs/restricted-feeds): get the feed registered as Restricted at your authentication origin, and set `PUBLISHER_AUTH_ORIGIN` on your server. Share the feed link with members.

## Step 3: Write the rule {#write-the-rule}

Your server decides through one interface in the source repository's Go publisher library, package `access` (`packages/publisher-support/access`):

```go
type Eligibility interface {
	Decide(ctx context.Context, subject Subject) (Decision, error)
}
```

`Subject.Wallet` is the address that signed the challenge. `Subject.Installation` is the fingerprint of that phone's device key. `Subject.Label` is whatever the phone calls itself: never decide on it.

| Decision | Means |
| --- | --- |
| `access.Eligible` | Approve now and issue the device's invitation |
| `access.Ineligible` | Reject a new request, or revoke an approved device |
| `access.Undecided` | Leave it for a person on the Devices page |

The shipped CopyTrading demo uses `access.ManualApproval{}`, which answers `Undecided` to everything. A membership rule answers from your records instead. In this example, `MembershipLookup` is **your own code**, reading your own database or billing provider; it is not a SAC API:

```go
package members

import (
	"context"
	"fmt"

	"github.com/BrRenat/SeekerAgentWallet/publisher-support/access"
)

// MembershipLookup is application-owned: your database, your billing provider's API, your cache.
type MembershipLookup interface {
	ActiveMember(ctx context.Context, wallet string) (bool, error)
}

// PaidMembers admits a device when the wallet that proved itself holds an active membership.
type PaidMembers struct{ Members MembershipLookup }

func (p PaidMembers) Decide(ctx context.Context, subject access.Subject) (access.Decision, error) {
	active, err := p.Members.ActiveMember(ctx, subject.Wallet)
	if err != nil {
		// Not a decision. At request time the request waits for a human; at renewal the grant is kept.
		return access.Undecided, fmt.Errorf("look up membership for %s: %w", subject.Wallet, err)
	}
	if !active {
		return access.Ineligible, nil
	}
	return access.Eligible, nil
}
```

**Return an error when the lookup fails.** An error is not a decision: at request time the request waits on the Devices page for a human, and at renewal the device keeps its access and is asked again at the next renewal. Returning `Ineligible` because your database was briefly down would reject or revoke paying members. Check the Devices page for requests left pending by lookup errors.

To cap devices per member, decide on `Wallet` and `Installation` together, and count installations in your own records.

## Step 4: Give the rule to both halves {#wire-the-rule}

The access service and the grant syncer each take the rule. **Pass it to both.** A syncer built without one falls back to manual approval, and renewals silently stop asking your rule: a member who cancelled would keep reading until someone intervened.

```go
rule := members.PaidMembers{Members: yourMembershipLookup}

syncer := access.NewSyncer(access.SyncPlan{
	Store: documents, Grants: gateway, Eligibility: rule,
	Lifetime: restricted.GrantLifetime, Channel: signals.ChannelFor(settings.ServerID),
	Log: log, Now: time.Now,
})
devices := access.New(access.Plan{
	Store: documents, Eligibility: rule, Syncer: syncer, Log: log, Now: time.Now,
	Settings: access.Settings{ /* ServerID, GatewayURL, AuthOrigin, lifetimes */ },
})
```

The rest of the wiring is the CopyTrading demo's `examples/demo-signals/cmd/copytrading/main.go`, with `access.ManualApproval{}` replaced by your rule in both places. The Go module path still carries the repository's former name, `SeekerAgentWallet`.

## Step 5: Know when your rule is asked {#when-the-rule-is-asked}

| When | What each answer does |
| --- | --- |
| A subscriber's wallet answers the challenge | `Eligible` approves and invites. `Ineligible` rejects. `Undecided` leaves it pending on the Devices page |
| The device redeems its invitation | Only `Ineligible` acts: the device is revoked and gets no session. The rule cannot approve a device here |
| The device's grant is due for renewal (when a third of its lifetime is left) | Only `Ineligible` acts: the device is revoked instead of renewed |

## Step 6: Handle cancellation and expiry {#cancellation}

When a membership ends, you have two ways to end access. Use both.

**Revoke explicitly, from your own cancellation handling.** When your billing provider tells you a membership ended, or your own expiry job runs, call your server's protected API:

```sh
curl -sS -X POST "http://127.0.0.1:8092/v1/access/wallets/$WALLET/revoke" \
  -H "Authorization: Bearer $PUBLISHER_API_TOKEN"
# {"revoked":2}
```

Use your server's API address (`PUBLISHER_API_ADDRESS`, `127.0.0.1:8092` by default). That revokes every device of that wallet. To revoke one device, `POST /v1/access/devices/{id}/revoke`. The webhook receiver, its authentication, and the mapping from your customer to a wallet are yours to build; none of it ships with SAC.

**Let renewal catch it.** Your rule is asked again whenever a device's grant comes up for renewal. With the default six-hour grant, renewal starts when two hours are left, so a lapsed membership is noticed within about four hours without any webhook.

Either way, a revocation is **pending until the gateway confirms it**, and the device can read until then. When your server cannot reach the gateway, the bound is what is left of the device's grant: at most six hours by default. Marking a membership inactive in your database does **not** end access by itself; it takes effect at the next check of your rule, or when you call the revoke API.

**Renewal after a lapse.** A revoked device is not revived. If the person pays again, they remove the feed in SAC and add it again. That creates a new device key and a new request, which their wallet signs once more, and your rule approves it. A person your rule *rejected* at request time can instead tap **Send access request** on the feed.

## Expected result {#expected-result}

A member adds your link and signs one message in their wallet (not a transaction; it moves no funds). Your rule answers `Eligible`, and their phone connects on its next check (every few seconds while SAC is open, or when they open the feed). A non-member is rejected at once. A member whose membership lapses is revoked at your explicit call or at the next renewal, after the gateway confirms. See [Join a Restricted feed](/docs/join-restricted-feed) for what they see.

## Next {#next}

- [Manage subscriber access](/docs/manage-subscriber-access): the states your rule's decisions move through.
- [Errors and limits](/docs/errors-and-limits#restricted-feeds)
