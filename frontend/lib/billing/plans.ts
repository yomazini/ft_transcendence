

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    maxUsers: 1,
    maxJobs: 5,
    description: "For individuals getting started.",
    features: [
      "1 organization member",
      "Basic workspace access",
      "Community support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 29,
    maxUsers: 5,
    maxJobs: 10,
    description: "For growing teams.",
    features: [
      "Up to 5 organization members",
      "Team collaboration",
      "Advanced insights",
      "Priority support",
    ],
  },
  {
    id: "extra",
    name: "Extra",
    price: 59,
    maxUsers: 20,
    maxJobs: 20,
    description: "For larger organizations.",
    features: [
      "Up to 20 organization members",
      "Team collaboration",
      "Advanced insights",
      "Priority support",
    ],
  },
]