/** Django API qaytaradigan ma'lumot shakllari. */

export type Paginated<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export type Choice = { value: string; label: string };

/** Tashkilot anketasining bitta savoli. */
export type ProblemQuestion = Choice & {
    /** Anketadagi tartib raqami (1-10) */
    number: number;
    icon: string;
    /** Qisqa nomi — «Inson omili» kabi */
    short: string;
};

export type Role = "yosh" | "entrepreneur" | "startupper" | "organization" | "admin";

export type Country = { value: string; label: string; short: string; color: string };

export type User = {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    role: Role;
    role_display: string;
    region: string;
    region_display: string;
    district: string;
    bio: string;
    avatar: string | null;
    initials: string;
    telegram_username: string;
    is_verified: boolean;
    is_panel_admin: boolean;
    /** Ro'yxatdan o'tishning qolgan qadami; hammasi tayyor bo'lsa `null` */
    onboarding: OnboardingStep;
    /** Botda so'raladi */
    age: number | null;
    study_location: "" | "uz" | "abroad";
    /** Bir odam bir nechta rolda bo'la oladi: biznesi, startaplari, tengdosh profili */
    capabilities?: { business: boolean; startups: number; peer: boolean };
};

export type MyStartups = { limit: number; results: StartupProfile[] };

/** Ommaviy profil — taklif yozgan yoshning ismiga bosilganda ochiladi. */
export type PublicProfile = {
    id: number;
    full_name: string;
    initials: string;
    avatar: string | null;
    role: Role;
    role_display: string;
    /** «Yosh», «Tadbirkor», «Startupper» — bir nechta bo'lishi mumkin */
    roles: string[];
    region_display: string;
    district: string;
    age: number | null;
    study_location: "" | "uz" | "abroad";
    study_location_display: string;
    bio: string;
    telegram_username: string;
    joined: string;
    business: PublicBusiness | null;
    startups: PublicStartup[];
    peer: Peer | null;
    stats: { initiatives: number; solutions: number; votes: number };
};

export type OnboardingStep = "role" | "business" | "startup" | "study" | "peer" | null;

/** Chet elda o'qiydigan yoshning o'z anketasi (kabinet). */
export type PeerProfile = {
    id: number;
    country: string;
    country_name: string;
    city: string;
    institution: string;
    course: number | null;
    field: string;
    achievements: string;
    phone: string;
    telegram: string;
    email: string;
    photo_url: string | null;
    status: string;
    created_at: string;
};

export type GalleryImage = { id: number; url: string; caption: string };

export type BusinessProfile = {
    id: number;
    name: string;
    sphere: string;
    sphere_display: string;
    stir: string;
    founded_year: number | null;
    employees: number;
    region: string;
    region_display: string;
    district: string;
    address: string;
    description: string;
    website: string;
    phone: string;
    email: string;
    telegram: string;
    instagram: string;
    logo_url: string | null;
    gallery: GalleryImage[];
    status: "pending" | "approved" | "rejected";
    status_display: string;
    created_at: string;
};

export type StartupProfile = {
    id: number;
    name: string;
    sphere: string;
    sphere_display: string;
    stage: string;
    stage_display: string;
    about: string;
    problem_solved: string;
    team_size: number;
    needed_investment: string | null;
    website: string;
    logo_url: string | null;
    pitch_url: string | null;
    status: "pending" | "approved" | "rejected";
    status_display: string;
    admin_note: string;
    created_at: string;
};

export type News = {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    category_display: string;
    image: string | null;
    published_at: string;
    views: number;
    is_featured: boolean;
    body?: string;
    author_name?: string;
};

export type Event = {
    id: number;
    slug: string;
    title: string;
    starts_at: string;
    ends_at: string | null;
    location: string;
    region: string;
    region_display: string;
    capacity: number;
    image: string | null;
    registered_count: number;
    seats_left: number;
    is_past: boolean;
    is_full: boolean;
    fill_percent: number;
    description?: string;
    is_registered?: boolean;
};

export type Announcement = {
    id: number;
    slug: string;
    title: string;
    type: string;
    type_display: string;
    icon: string;
    body: string;
    posted_at: string;
    deadline: string | null;
    is_active: boolean;
    is_expired: boolean;
    file: string | null;
};

/** 14 yo'nalishdan biri — tirik sahnani chizish uchun hamma narsa shu yerda. */
export type Direction = {
    id: string;
    scene: string;
    name: string;
    title: string;
    tagline: string;
    color: string;
    accent: string;
    /** Sahna to'lishi uchun kerakli ovozlar soni */
    max: number;
    /** Sahna birligi: "barg", "tanga", "neyron"... */
    unit: string;
    /** Xom SVG yo'l(lar)i — 40x40 viewBox */
    icon: string;
    votes: number;
    ideas: number;
};

export type InitiativeComment = {
    id: number;
    /** Muallif ro'yxatdan o'tgan bo'lsa — profiliga havola uchun */
    author_id: number | null;
    author_name: string;
    author_label: string;
    initials: string;
    text: string;
    created_at: string;
};

export type Initiative = {
    id: number;
    direction: string;
    direction_info: Direction;
    kind: string;
    kind_display: string;
    kind_icon: string;
    title: string;
    summary: string;
    description: string;
    expected_result: string;
    author_label: string;
    region: string;
    region_display: string;
    vote_count: number;
    comment_count: number;
    voted: boolean;
    created_at: string;
    rank?: number;
    comments?: InitiativeComment[];
    siblings?: Initiative[];
};

export type Organization = {
    id: number;
    name: string;
    sphere: string;
    sphere_display: string;
    region: string;
    region_display: string;
};

export type Solution = {
    id: number;
    /** Muallif ro'yxatdan o'tgan bo'lsa — profiliga havola uchun */
    author_id: number | null;
    author_name: string;
    title: string;
    description: string;
    technologies: string;
    expected_result: string;
    like_count: number;
    liked: boolean;
    created_at: string;
};

export type Problem = {
    id: number;
    organization: Organization;
    category: string;
    category_display: string;
    icon: string;
    question: string;
    description: string;
    age_label: string;
    solution_count: number;
    created_at: string;
    solutions?: Solution[];
};

export type Peer = {
    id: number;
    full_name: string;
    country: string;
    country_name: string;
    country_short: string;
    country_color: string;
    city: string;
    home_region: string;
    home_region_display: string;
    purpose: string;
    purpose_display: string;
    purpose_icon: string;
    institution: string;
    field: string;
    since_year: number | null;
    course: number | null;
    achievements: string;
    about: string;
    can_help: string;
    telegram: string;
    email: string;
    phone: string;
    age: number | null;
    photo: string | null;
    initials: string;
    created_at: string;
};

export type Startup = {
    id: number;
    name: string;
    sphere: string;
    sphere_display: string;
    sphere_icon: string;
    stage: string;
    stage_display: string;
    about: string;
    problem_solved: string;
    team_size: number;
    created_at: string;
};

/** Ochiq ro'yxatdagi tadbirkor kartasi. */
export type PublicBusiness = {
    id: number;
    name: string;
    sphere: string;
    sphere_display: string;
    sphere_icon: string;
    region: string;
    region_display: string;
    district: string;
    description: string;
    employees: number;
    founded_year: number | null;
    logo_url: string | null;
    /** Birinchi yuklangan rasm — kartaning muqovasi */
    cover_url: string | null;
    photo_count: number;
    created_at: string;
};

export type PublicBusinessDetail = PublicBusiness & {
    address: string;
    website: string;
    phone: string;
    email: string;
    telegram: string;
    instagram: string;
    gallery: GalleryImage[];
    owner_name: string;
};

/** Ochiq ro'yxatdagi startap kartasi. */
export type PublicStartup = {
    id: number;
    name: string;
    sphere: string;
    sphere_display: string;
    sphere_icon: string;
    stage: string;
    stage_display: string;
    about: string;
    team_size: number;
    needed_investment: string | null;
    region: string;
    region_display: string;
    logo_url: string | null;
    created_at: string;
};

export type PublicStartupDetail = PublicStartup & {
    problem_solved: string;
    website: string;
    pitch_url: string | null;
    full_name: string;
};

export type Overview = {
    stats: {
        initiatives: number;
        votes: number;
        problems: number;
        solutions: number;
        peers: number;
        /** Saytdagi yoshlar soni (eski keshda bo'lmasligi mumkin) */
        users?: number;
        events: number;
        businesses: number;
        startups: number;
    };
    businesses: PublicBusiness[];
    startups: PublicStartup[];
    top_initiatives: Initiative[];
    latest_news: News[];
    upcoming_events: Event[];
    announcements: Announcement[];
    peers: Peer[];
    open_problems: Problem[];
};

export type Reference = {
    regions: Choice[];
    roles: Choice[];
    all_roles: Choice[];
    initiative_kinds: Choice[];
    news_categories: Choice[];
    problem_questions: ProblemQuestion[];
    startup_spheres: Choice[];
    startup_stages: Choice[];
    business_spheres: Choice[];
    announcement_types: Choice[];
    organization_spheres: Choice[];
    appeal_categories: Choice[];
    peer_purposes: Choice[];
    countries: Country[];
};

export type VoteResult = {
    votes: number;
    rank: number;
    direction: string;
    direction_votes: number;
    milestone: boolean;
    message: string;
};

export type AuthResult = {
    access: string;
    refresh: string;
    user: User;
    needs_profile: boolean;
};
