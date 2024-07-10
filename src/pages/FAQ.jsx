// src/pages/FAQ.jsx

import backgroundImage from "./../../assets/bg.png"; // Update this path to your background image

const FAQ = () => {
  const faqs = [
    {
      question: "How do I earn money?",
      answer:
        "You can earn money in three ways: Betting on games, buying mining bots, and referring new users.",
    },
    {
      question: "How do I earn money from betting on games?",
      answer:
        "You can bet on your favorite games and earn money from each victorious bet you make.",
    },
    {
      question: "How do I earn money from buying mining bots?",
      answer:
        "Invest in our powerful mining bots. The more bots you own, the higher your potential earnings!",
    },
    {
      question: "How do I earn money from referring new users?",
      answer:
        "Share your unique referral code with friends and family. You earn 10% of the earnings from every activity your referred users engage in.",
    },
    {
      question: "How do I withdraw my earnings?",
      answer:
        "You can withdraw your earnings using Mobile Money once you have a balance of more than GHS 5.",
    },
    {
      question: "Can I use my activation money for betting?",
      answer:
        "YES, activation money can be used for betting. You need to deposit additional funds or use your earnings.",
    },
    {
      question: "How often can I bet on games?",
      answer: "You can Bet as many as you want but bet responsibly..",
    },
    {
      question: "How long does it take to withdraw my money?",
      answer:
        "Withdrawals take 5 to 10 minutes to process and credit to your mobile money account.",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-white p-8 rounded shadow-md w-96 bg-opacity-80 backdrop-filter backdrop-blur-lg">
        <h1 className="text-2xl mb-4">Frequently Asked Questions</h1>
        {faqs.map((faq, index) => (
          <div key={index} className="mb-4">
            <h2 className="font-bold">{faq.question}</h2>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
