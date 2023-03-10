import {
  createQuery,
  QueryClient,
  QueryClientProvider,
} from "@adeora/solid-query";
import type { IPokemon } from "pokeapi-typescript";
import { createSignal, For, Index, Show } from "solid-js";

const fetchPokemon = async (id: number) => {
  const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(
    (res) => res.json()
  );
  return pokemon as IPokemon;
};

// Load First Query on Server
const firstPokemon = await fetchPokemon(1);
const [pokemon, setPokemon] = createSignal(1);

const Pokedex = () => {
  const pokemonQuery = createQuery(() => ({
    queryKey: ["pokemon", pokemon()],
    queryFn: () => fetchPokemon(pokemon()),
    // Prefill the cache only for the first pokemon
    initialData: pokemon() == 1 ? firstPokemon : undefined,
    // Keep previous data around while loading new data
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60,
  }));

  return (
    <div class="flex justify-center">
      <Pokemon pokemon={pokemonQuery.data} />
    </div>
  );
};

function Pokemon(props: { pokemon: IPokemon | undefined }) {
  const properCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const createLeadingZero = (num: number) => {
    return num.toString().padStart(3, "0");
  };

  return (
    <div class="w-[400px] h-[620px] bg-neutral-400/20 rounded-xl relative">
      <div class="absolute overflow-hidden inset-4 bg-[#06172c] rounded-md flex flex-col">
        <div class="h-12 mt-2 justify-between flex items-center">
          <button
            onClick={() => setPokemon((prev) => prev - 1)}
            class="h-12 w-12 flex justify-center items-center text-neutral-600 hover:text-neutral-500"
          >
            <svg
              fill="currentColor"
              stroke-width="0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              height="2em"
              width="2em"
              style="overflow: visible;"
            >
              <path
                d="M328 112 184 256l144 144"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="48px"
              ></path>
            </svg>
          </button>
          <h1 class="text-2xl tabular-nums text-neutral-200/50 font-semibold">
            #{createLeadingZero(pokemon())}
          </h1>
          <button
            onClick={() => setPokemon((prev) => prev + 1)}
            class="h-12 w-12 flex justify-center items-center text-neutral-600 hover:text-neutral-500"
          >
            <svg
              fill="currentColor"
              stroke-width="0"
              class="transform rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              height="2em"
              width="2em"
              style="overflow: visible;"
            >
              <path
                d="M328 112 184 256l144 144"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="48px"
              ></path>
            </svg>
          </button>
        </div>
        <div class="h-[36%] relative mt-2">
          <img
            class="absolute blur-2xl inset-0 w-full h-full object-contain"
            // @ts-ignore
            src={props.pokemon?.sprites.other["official-artwork"].front_default}
          ></img>
          <img
            class="absolute inset-0 w-full h-full object-contain object-center"
            // @ts-ignore
            src={props.pokemon?.sprites.other["official-artwork"].front_default}
          ></img>
        </div>
        <div class="text-center mt-1 text-3xl font-semibold text-neutral-200/80">
          {properCase(props.pokemon?.name || "")}
        </div>
        <div class="flex gap-2 justify-center">
          <For each={props.pokemon?.types || []}>
            {(type) => (
              <div class="flex justify-center mt-3 border-2 border-[#8bd8ff75] px-5 rounded-full">
                <div class="text-center text-neutral-200/80">
                  {properCase(type.type.name)}
                </div>
              </div>
            )}
          </For>
        </div>
        <div class="mt-4 px-6 flex gap-4">
          <div>
            <Index each={props.pokemon?.stats || []}>
              {(stat, i) => (
                <div class="flex justify-between mt-2">
                  <div class="text-neutral-200/80">
                    {stat().stat.name == "special-attack"
                      ? "SP. ATTCK"
                      : stat().stat.name == "special-defense"
                      ? "SP. DEFNS"
                      : stat().stat.name.toUpperCase()}
                  </div>
                </div>
              )}
            </Index>
          </div>
          <div class="flex-1">
            <Index each={props.pokemon?.stats || []}>
              {(stat, i) => (
                <div class="flex items-center mt-2 h-6">
                  <div class="flex-1 h-3 bg-[#08121c] rounded-full relative">
                    <div
                      class="absolute transition-all inset-y-0 bg-[#8bd8ff] left-0 rounded-full"
                      style={{
                        width: `${
                          stat().base_stat < 100 ? stat().base_stat : 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </Index>
          </div>
          <div>
            <Index each={props.pokemon?.stats || []}>
              {(stat, i) => (
                <div class="flex justify-between mt-2">
                  <div class="text-neutral-200/80 tabular-nums">
                    {stat().base_stat}
                  </div>
                </div>
              )}
            </Index>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PokedexProvider() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Pokedex />
    </QueryClientProvider>
  );
}
