import { db, faqs } from "@/lib/db";
import { asc } from "drizzle-orm";

export const getContact = async () => {
  const contactRes = await db.query.about.findFirst();

  const response = `https://wa.me/62${contactRes?.whatsapp}?text=${encodeURIComponent(contactRes?.message ?? "")}`;

  return response;
};

export const getFAQs = async (q: string) => {
  const faqsRes = await db.query.faqs.findMany({
    orderBy: asc(faqs.position),
    where: (f, { ilike, or }) =>
      or(ilike(f.question, `%${q}%`), ilike(f.answer, `%${q}%`)),
  });

  const response = faqsRes.map((i) => ({
    question: i.question,
    answer: i.answer,
  }));

  return response;
};

export const getFooter = async () => {
  const footerRes = await db.query.about.findFirst();

  const response = {
    sosmed: {
      facebook: footerRes?.facebook ?? "",
      linkedin: footerRes?.linkedin ?? "",
      instagram: footerRes?.instagram ?? "",
    },
    store: {
      name: footerRes?.name ?? "",
      address: footerRes?.address ?? "",
    },
  };

  return response;
};

export const getPolicies = async () => {
  const policiesRes = await db.query.policies.findFirst();

  const response = {
    privacy: policiesRes?.privacy ?? "",
    refund: policiesRes?.return ?? "",
    term: policiesRes?.termOfUse ?? "",
  };

  return response;
};
