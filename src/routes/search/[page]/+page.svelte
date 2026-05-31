


<script>

import { onMount } from 'svelte';
import Card from './../../../components/show-card.svelte'


let target
let properTarget
let searchResults
let page


    onMount(async() => {
        
 
        target = window.location.search.split('=')[1]
        properTarget = target.replaceAll('+', " ")
        let temPpage = window.location.pathname.split('/')[2]
        page = temPpage.split('?')[0]
        
        console.log(page)


        const res = await fetch(`/api/anime/list/search/${page}?q=${encodeURIComponent(properTarget)}`);
		searchResults = await res.json();

        console.log(searchResults)
    })
</script>





<svelte:head>
    {#if properTarget}
    <title>Search results for {properTarget} on Soul Tv</title>
    {/if}

    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&family=Ubuntu&display=swap" rel="stylesheet">
</svelte:head>




{#if searchResults}
<div class="main-container">

    <h1 class="announcement">Search Results for {properTarget}</h1>

    <div class='result-container'>

        {#if searchResults.results.length > 0}
        {#each searchResults.results as result}
            <Card title={result.title} poster={result.image} animeID={result.id}></Card>
        {/each}
        {:else}
            <h1 class="announcement">No results</h1>
        {/if}

    </div>
    <!-- {#if searchResults.totalPages}
    <div class="button-house">

        {#each {length:(searchResults.totalPages)} as button, i}
        {#if (i) == page}
            <a href="/search/{i}" data-sveltekit-reload>

                <button class='selected-button'>{i}</button>

            </a>

        {:else}
        <a href="/search/{i}" data-sveltekit-reload>

            <button class='selected-button'>{i}</button>

        </a>

        {/if}
        {/each}
   
    </div>
    {/if} -->

</div>

{/if}

<style>
    .main-container{
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;

        height: 100%;
    }
    .announcement{
        font-family: "Rubik", sans-serif;
        font-optical-sizing: auto;
        font-weight: 500;
        font-style: normal;
        color: #FF331F;
    }
    .result-container{
        display: flex;
        flex-wrap:wrap;

        align-items: center;
        justify-content:start;

        padding-left: 3vw;

    
        
    }
</style>

