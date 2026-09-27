export type Entry = Record<string, unknown> & { id?: string; visible?: boolean; order?: number; slug?: string };
export type PortfolioContent = {
  site: Record<string, any>;
  profile: Record<string, any>;
  about: Record<string, any>;
  experience: Entry[];
  projects: Entry[];
  skills: Entry[];
  education: Entry[];
  services: Entry[];
  testimonials: Entry[];
  awards: Entry[];
  contact: Record<string, any>;
};
