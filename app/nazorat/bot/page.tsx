import { BotManager, type BotPost } from "@/components/panel/bot-manager";
import { panelFetch } from "@/lib/panel";

export default async function PanelBotPage() {
    const data = await panelFetch<{ auto_post: boolean; results: BotPost[] }>("/bot/");

    return <BotManager autoPost={data.auto_post} posts={data.results} />;
}
