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

export type Role = "entrepreneur" | "startupper" | "organization" | "admin";

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
    about: string;
    can_help: string;
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

export type Overview = {
    stats: {
        initiatives: number;
        votes: number;
        problems: number;
        solutions: number;
        peers: number;
        events: number;
    };
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
    countries: { value: string; label: string; short: string; color: string }[];
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
