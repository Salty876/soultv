<script>
    import { onMount } from "svelte";
    import Card from '../../../../components/show-card.svelte';


    let page
    let pref
    let info
    let officalName
    let numOfPages 
    let pagesArray

    onMount(async() => {
        let stuffUpThere = window.location.pathname.split('/')

        page = stuffUpThere[3]
        pref = stuffUpThere[2]
        officalName = pref.replaceAll('-', ' ')
        let word = officalName
        word = word.split(' ')
        for(let i = 0; i< word.length; i++){
            word[i] = word[i][0].toUpperCase() + word[i].substr(1)
        }
        officalName=  word.join(' ')

        const res = await fetch(`/api/anime/list/${pref}/${page}`);
		info = await res.json();


        numOfPages = info.totalPages
        pagesArray = [0,1,2,3,4,5,6,7,8,9]
        console.log(numOfPages)

    })
</script>




<svelte:head>

    <title>{officalName} on Soul Tv</title> 


    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=My+Soul&family=Noto+Sans+Nag+Mundari:wght@400..700&family=Rubik:ital,wght@0,300..900;1,300..900&family=Ubuntu&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&family=Ubuntu&display=swap" rel="stylesheet">

</svelte:head>






{#if info}

<div class="main-page">
    <h1 class="announcements">{officalName}</h1>
    <div class="cards">
        {#each info.results as anime}
            <Card title={anime.title} animeID={anime.id} poster={anime.image}></Card>
        {/each}
    </div>

    <div class="button-house">

        {#each pagesArray as button}
        {#if (button + 1) == page}
            <a href="/chart/{pref}/{button + 1}" data-sveltekit-reload>

                <button class='selected-button'>{button + 1}</button>

            </a>

        {:else}
        <a href="/chart/{pref}/{button + 1}" data-sveltekit-reload>

            <button class='non-selected-button'>{button + 1}</button>

        </a>
        {/if}
        {/each}

   
    </div>
     

           
        
</div>
    
{/if}


<style>
    .main-page{
        padding-top: 15vh;
        padding-bottom: 15vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        width: 100vw;
    }

    .announcements{
        font-family: "Rubik", sans-serif;
        font-optical-sizing: auto;
        font-weight: 700;
        font-style: normal;
        color: #FF331F;
        font-size: xx-large;
    }
    


    .cards{
        width: 100vw;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }


    .button-house{
        width: 100vw;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 1vw;

        padding-top: 40px;
    }

    .selected-button{
        width: 3.5vw;
        height: 3.5vw;
        font-size: larger;

        border-color:  #FF331F;
        border-width: 5px;
        border-radius: 5px;
        background-color: #FF331F;
        color: #363537;
        border-style: unset;
    }

    .non-selected-button{
        width: 3.5vw;
        height: 3.5vw;
        font-size: larger;

        border-color:  #FF331F;
        
        border-width: 5px;
        border-radius: 5px;
        background-color: #363537;
        color: #FF331F;
        border-style: solid;
        }

    .non-selected-button:hover{
        border-color:  #FF331F;
        border-width: 5px;
        border-radius: 5px;
        background-color: #FF331F;
        color: #363537;
        border-style: unset;
    }


    @media(max-width: 1200px) {
        .selected-button{
            width: 13vw;
            height: 13vw;
        }

        .non-selected-button{
            width: 13vw;
            height: 13vw;
        }
    }
</style>


