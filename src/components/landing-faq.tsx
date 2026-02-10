
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const faqItems = [
  {
    question: "How do I get started with ElonTradeX?",
    answer:
      "Getting started is simple! Just click the 'Sign Up' button, fill out the registration form with your details, and you'll be ready to trade in minutes. Every new user automatically receives a $200 USDT bonus to start their portfolio.",
  },
  {
    question: "How secure are my funds and personal information?",
    answer:
      "Security is our top priority. We use industry-leading measures, including cold storage for the majority of digital assets, multi-signature wallets, and end-to-end encryption to protect your information. Our platform is built to be a fortress for your funds.",
  },
  {
    question: "What are the trading fees?",
    answer:
      "We believe in transparent and competitive pricing. Our 'Starter' plan is completely free with a 0.1% transaction fee. For more active traders, our 'Pro' and 'Enterprise' plans offer significantly lower fees and additional benefits. You can see the full details in our pricing section.",
  },
  {
    question: "Can I trade on my mobile device?",
    answer:
      "Yes! ElonTradeX offers a fully-featured mobile app for both iOS and Android. You can trade, manage your portfolio, and access all our tools from anywhere, at any time, with the same power and security as the desktop platform.",
  },
  {
    question: "What is the $200 USDT signup bonus?",
    answer:
      "As a welcome gift, every new user who successfully registers an account on ElonTradeX receives a $200 USDT bonus credited directly to their portfolio. This bonus is available for trading immediately, giving you a head start on your crypto journey.",
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Have questions? We've got answers. Here are some of the most common things our users ask.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem value={`item-${index + 1}`} key={index}>
                <AccordionTrigger className="text-lg text-left hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
