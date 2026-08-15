// src/lib/operator-queries.ts
import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type OperatorCompany = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  county: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  license_number: string | null;
  logo_url: string | null;
  verified: boolean;
  created_at: string;
  business_reg_number: string | null;
  kra_pin: string | null;
  kato_membership: string | null;
  physical_address: string | null;
  maps_url: string | null;
  contact_person: string | null;
  whatsapp: string | null;
  cover_image_url: string | null;
  years_in_business: number | null;
  employees: number | null;
  languages: string[];
  vehicle_types: string[];
  safari_specialties: string[];
  tour_categories: string[];
  status: string;
  admin_note: string | null;
  reviewed_at: string | null;
};

type ApiCompany = {
  id: string; ownerId: string; name: string; slug: string; description: string | null;
  county: string | null; phone: string | null; email: string | null; website: string | null;
  licenseNumber: string | null; logoUrl: string | null; verified: boolean; createdAt: string;
  businessRegNumber: string | null; kraPin: string | null; katoMembership: string | null;
  physicalAddress: string | null; mapsUrl: string | null; contactPerson: string | null;
  whatsapp: string | null; coverImageUrl: string | null; yearsInBusiness: number | null;
  employees: number | null; languages: string[]; vehicleTypes: string[];
  safariSpecialties: string[]; tourCategories: string[]; status: string;
  adminNote: string | null; reviewedAt: string | null;
};

function mapCompany(c: ApiCompany): OperatorCompany {
  return {
    id: c.id, owner_id: c.ownerId, name: c.name, slug: c.slug, description: c.description,
    county: c.county, phone: c.phone, email: c.email, website: c.website,
    license_number: c.licenseNumber, logo_url: c.logoUrl, verified: c.verified,
    created_at: c.createdAt, business_reg_number: c.businessRegNumber, kra_pin: c.kraPin,
    kato_membership: c.katoMembership, physical_address: c.physicalAddress, maps_url: c.mapsUrl,
    contact_person: c.contactPerson, whatsapp: c.whatsapp, cover_image_url: c.coverImageUrl,
    years_in_business: c.yearsInBusiness, employees: c.employees, languages: c.languages,
    vehicle_types: c.vehicleTypes, safari_specialties: c.safariSpecialties,
    tour_categories: c.tourCategories, status: c.status, admin_note: c.adminNote,
    reviewed_at: c.reviewedAt,
  };
}

export const allCompaniesQuery = queryOptions({
  queryKey: ["all-companies"],
  queryFn: async (): Promise<OperatorCompany[]> => {
    const data = await api.get<ApiCompany[]>("/api/operators/admin");
    return data.map(mapCompany);
  },
});

// NOTE: file uploads have no backend yet (Supabase Storage removed).
// These are stubs so the app compiles — wire up real file storage
// (e.g. multer + local disk, or S3) when you're ready to support uploads.
export async function uploadCompanyMedia(
  _userId: string,
  _kind: "logo" | "cover",
  _file: File,
): Promise<string> {
  throw new Error("File uploads are not yet supported by the backend.");
}

export async function signCompanyMedia(path: string | null): Promise<string | null> {
  return path; // no signing needed once you're serving files from your own server
}

export type TravellerLeadContact = {
  email: string | null;
  full_name: string | null;
  phone: string | null;
};

export type LeadRequest = {
  id: string;
  trip_request_id: string;
  company_id: string;
  traveller_id: string;
  message: string | null;
  offer_amount_kes: number | null;
  package_details: string | null;
  offer_valid_until: string | null;
  status: string;
  created_at: string;
  traveller_contact: TravellerLeadContact | null;
};

export type Review = {
  id: string;
  user_id: string;
  destination_slug: string | null;
  company_id: string | null;
  rating: number;
  title: string | null;
  body: string;
  photos: string[];
  author_name: string | null;
  verified_traveler: boolean;
  helpful_count: number;
  created_at: string;
};

export const myRolesQuery = queryOptions({
  queryKey: ["my-roles"],
  queryFn: async (): Promise<string[]> => {
    const me = await api.get<{ roles: string[] }>("/api/auth/me");
    return me.roles;
  },
});

export const myCompanyQuery = queryOptions({
  queryKey: ["my-company"],
  queryFn: async (): Promise<OperatorCompany | null> => {
    try {
      const data = await api.get<ApiCompany>("/api/operators/me");
      return mapCompany(data);
    } catch {
      return null;
    }
  },
});

export type Lead = {
  id: string;
  destination_name: string;
  destination_slug: string | null;
  start_date: string | null;
  end_date: string | null;
  flexible_dates: boolean;
  adults: number;
  children: number;
  budget_usd: number | null;
  accommodation_type: string | null;
  transport_preference: string | null;
  luxury_level: string | null;
  activities: string[];
  nationality: string | null;
  arrival_airport: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  user_id: string;
};

type ApiOpenLead = {
  id: string; destinationName: string; destinationSlug: string | null;
  startDate: string | null; endDate: string | null; flexibleDates: boolean;
  adults: number; children: number; budgetUsd: number | null;
  accommodationType: string | null; transportPreference: string | null;
  luxuryLevel: string | null; activities: string[]; nationality: string | null;
  arrivalAirport: string | null; notes: string | null; status: string;
  createdAt: string; userId: string;
};

function mapLead(l: ApiOpenLead): Lead {
  return {
    id: l.id, destination_name: l.destinationName, destination_slug: l.destinationSlug,
    start_date: l.startDate, end_date: l.endDate, flexible_dates: l.flexibleDates,
    adults: l.adults, children: l.children, budget_usd: l.budgetUsd,
    accommodation_type: l.accommodationType, transport_preference: l.transportPreference,
    luxury_level: l.luxuryLevel, activities: l.activities, nationality: l.nationality,
    arrival_airport: l.arrivalAirport, notes: l.notes, status: l.status,
    created_at: l.createdAt, user_id: l.userId,
  };
}

export const openLeadsQuery = queryOptions({
  queryKey: ["open-leads"],
  queryFn: async (): Promise<Lead[]> => {
    const data = await api.get<ApiOpenLead[]>("/api/trip-requests/open");
    return data.slice(0, 100).map(mapLead);
  },
});

type ApiTravellerContact = { email: string | null; fullName: string | null; phone: string | null } | null;

type ApiLeadRequest = {
  id: string; tripRequestId: string; companyId: string; travellerId: string;
  message: string | null; offerAmountKes: number | null; packageDetails: string | null;
  offerValidUntil: string | null; status: string; createdAt: string;
  travellerContact?: ApiTravellerContact;
};

function mapLeadRequest(l: ApiLeadRequest): LeadRequest {
  return {
    id: l.id, trip_request_id: l.tripRequestId, company_id: l.companyId,
    traveller_id: l.travellerId, message: l.message,
    offer_amount_kes: l.offerAmountKes, package_details: l.packageDetails,
    offer_valid_until: l.offerValidUntil, status: l.status, created_at: l.createdAt,
    traveller_contact: l.travellerContact
      ? {
          email: l.travellerContact.email,
          full_name: l.travellerContact.fullName,
          phone: l.travellerContact.phone,
        }
      : null,
  };
}

export const myLeadRequestsQuery = (companyId: string | undefined) =>
  queryOptions({
    queryKey: ["lead-requests", "company", companyId],
    queryFn: async (): Promise<LeadRequest[]> => {
      const data = await api.get<ApiLeadRequest[]>("/api/leads/mine");
      return data.map(mapLeadRequest);
    },
  });

export type TravellerContact = {
  id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  nationality: string | null;
  preferred_language: string;
};

// Traveller contacts are only revealed via accepted lead requests now
// (see incomingLeadRequestsQuery below) rather than a separate open query,
// since the backend doesn't expose a bare profiles list.
export const unlockedContactsQuery = queryOptions({
  queryKey: ["unlocked-contacts"],
  queryFn: async (): Promise<TravellerContact[]> => {
    return [];
  },
});

type ApiIncomingLead = ApiLeadRequest & {
  tripRequest: ApiOpenLead;
  company?: { id: string; name: string; slug: string; logoUrl: string | null; phone: string | null; whatsapp: string | null; email: string | null };
};

export const incomingLeadRequestsQuery = queryOptions({
  queryKey: ["incoming-lead-requests"],
  queryFn: async () => {
    const data = await api.get<ApiIncomingLead[]>("/api/leads/received");
    return data.map((l) => ({
      ...mapLeadRequest(l),
      operator_companies: l.company
        ? {
            id: l.company.id,
            name: l.company.name,
            slug: l.company.slug,
            phone: l.company.phone,
            email: l.company.email,
          }
        : null,
    }));
  },
});

type ApiReview = {
  id: string; userId: string; destinationSlug: string | null; companyId: string | null;
  rating: number; title: string | null; body: string; photos: string[];
  authorName: string | null; verifiedTraveler: boolean; helpfulCount: number; createdAt: string;
};

function mapReview(r: ApiReview): Review {
  return {
    id: r.id, user_id: r.userId, destination_slug: r.destinationSlug, company_id: r.companyId,
    rating: r.rating, title: r.title, body: r.body, photos: r.photos,
    author_name: r.authorName, verified_traveler: r.verifiedTraveler,
    helpful_count: r.helpfulCount, created_at: r.createdAt,
  };
}

export const destinationReviewsQuery = (slug: string) =>
  queryOptions({
    queryKey: ["reviews", slug],
    queryFn: async (): Promise<Review[]> => {
      const data = await api.get<ApiReview[]>(`/api/reviews?destinationSlug=${encodeURIComponent(slug)}`);
      return data
        .map(mapReview)
        .sort((a, b) => b.helpful_count - a.helpful_count || b.created_at.localeCompare(a.created_at));
    },
  });

// Review votes aren't separately listable by the backend yet — treated as
// empty until you add a GET /api/reviews/my-votes endpoint if you need this.
export const myReviewVotesQuery = queryOptions({
  queryKey: ["my-review-votes"],
  queryFn: async (): Promise<string[]> => {
    return [];
  },
});

export async function signPhotoPaths(paths: string[]): Promise<string[]> {
  return paths; // no signing needed — see uploadCompanyMedia note above
}