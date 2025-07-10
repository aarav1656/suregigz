import Image from "next/image";
import { notFound } from "next/navigation";

const gigs = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=400&q=80",
    title: "Full Stack Web Developer Needed",
    description: "Build a modern web app for a fintech startup. React, Node.js, and MongoDB experience required.",
    pay: 1200,
    details: "You will work with a small team to deliver a scalable fintech platform. Experience with cloud deployment and CI/CD is a plus. Flexible hours, remote work possible.",
    postedBy: "Fintech Innovations Inc.",
    postedAt: "2 days ago",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&q=80",
    title: "UI/UX Designer for Mobile App",
    description: "Design a beautiful and intuitive mobile app for a health tech company. Figma and mobile experience required.",
    pay: 900,
    details: "Work closely with product managers and developers to create wireframes and prototypes. Portfolio required.",
    postedBy: "HealthTech Solutions",
    postedAt: "5 days ago",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=facearea&w=400&q=80",
    title: "Smart Contract Developer (NEAR)",
    description: "Develop and audit smart contracts for a DeFi platform on NEAR Protocol. Rust experience a plus.",
    pay: 1500,
    details: "You will be responsible for writing, testing, and deploying smart contracts. Security and audit experience preferred.",
    postedBy: "DeFi Labs",
    postedAt: "1 day ago",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&q=80",
    title: "Content Writer for Tech Blog",
    description: "Write engaging and SEO-friendly articles for a leading tech blog. Blockchain knowledge preferred.",
    pay: 400,
    details: "Write 2-3 articles per week. Topics provided in advance. Prior experience in tech writing is a plus.",
    postedBy: "TechBloggers",
    postedAt: "3 days ago",
  },
];

export default async function GigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gig = gigs.find((g) => g.id === Number(id));
  if (!gig) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-gray-800 rounded-2xl shadow-lg border border-cyan-500/30 overflow-hidden">
          <div className="relative h-64 w-full">
            <Image
              src={gig.image}
              alt={gig.title}
              fill
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={true}
            />
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-2 font-['Press_Start_2P'] text-cyan-300">
              {gig.title}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-cyan-700/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
                {gig.postedBy}
              </span>
              <span className="text-gray-400 text-xs">{gig.postedAt}</span>
            </div>
            <p className="text-lg text-gray-200 mb-6">{gig.description}</p>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-purple-400 mb-2">Details</h2>
              <p className="text-gray-300 bg-gray-900 rounded-lg p-4 text-base">
                {gig.details}
              </p>
            </div>
            <div className="flex items-center justify-between mt-8">
              <span className="text-2xl font-bold text-purple-400">
                ${gig.pay}
              </span>
              <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold hover:from-cyan-500 hover:to-purple-500 transition-colors font-['Press_Start_2P'] text-sm">
                Apply for this Gig
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 