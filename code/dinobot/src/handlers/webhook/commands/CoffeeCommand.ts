import { APIEmbed } from "discord-api-types/v10";
import { ICommand } from "./ICommand";

export const CoffeeCommand: ICommand = {
    definition: {
        name: 'coffee',
        description: 'Replies with coffee!',
    },
    handler: async (interaction, env) => {
        let amountOfCoffees = 0;

        if (env.COFFEE_COUNTER_WORKER) {
            const coffeeCounterResponse = await env.COFFEE_COUNTER_WORKER.fetch("https://tm-coffeecounter.jonasclaesbe.workers.dev/api/coffee-count");
            const coffeeCounterData: { amountOfCoffees: number } = await coffeeCounterResponse.json();
            amountOfCoffees = coffeeCounterData.amountOfCoffees;
        } else {
            const coffeeCounterResponse = await fetch("https://tm-coffeecounter.jonasclaesbe.workers.dev/api/coffee-count");
            const coffeeCounterData: { amountOfCoffees: number } = await coffeeCounterResponse.json();
            amountOfCoffees = coffeeCounterData.amountOfCoffees;
        }

        const embed: APIEmbed = {
            title: "COFFEEEEE!!!",
            color: 0xd2a575,
            image: {
                url: "https://imgur.com/QX6O7af.jpg"
            },
            description: `Coffee count: ${amountOfCoffees}`,
            url: "https://jonasclaes.be/coffee-counter/",
            author: {
                name: "Jonas Claes",
                icon_url: "https://avatars.githubusercontent.com/u/25551249?v=4",
                url: "https://jonasclaes.be/"
            },
            thumbnail: {
                url: "https://imgur.com/QX6O7af.jpg"
            },
            footer: {
                text: "Designed By Nick",
                icon_url: "https://avatars.githubusercontent.com/u/91118370?v=4"
            },
            timestamp: new Date().toISOString()
        }

        return {
            embeds: [embed]
        }
    }
}
