


<script>
    // window.location.reload();
    import { onMount } from 'svelte';
    import { invalidateAll } from '$app/navigation';    
    import Episode from '../../../components/episode-box.svelte'
    import Card from '../../../components/show-card.svelte'


    console.log('pageChange')
    let tempCode = []
    let animeData
    let MALanime
    let fillerData
    let organizedEpisodes
    let arrayof100
    let order = 'desc'



    let animeInfoLoaded = false



    onMount(async() => {
        
 
        tempCode = window.location.pathname.split('/')
      
        
        const res = await fetch(`/api/anime/${encodeURIComponent(tempCode[2])}`);
        const payload = await res.json();
        animeData = payload.animeData;

        const fillerRes = await fetch(`/api/anime/${encodeURIComponent(tempCode[2])}/filler`);
        fillerData = await fillerRes.json();

        animeData.episodes = animeData.episodes.map((episode) => {
            const fillerEpisode = fillerData.episodes?.find((entry) => entry.number === episode.number);
            return {
                ...episode,
                isFiller: fillerEpisode ? fillerEpisode.isFiller : episode.isFiller,
                fillerStatus: fillerEpisode ? fillerEpisode.fillerStatus : null,
            };
        });

        const rep = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeData.title)}&sfw`);
        const malPayload = await rep.json();
        MALanime = malPayload.data?.[0] || null;
        console.log(MALanime)


        invalidateAll();
        animeInfoLoaded = true


        if (animeData.totalEpisodes > 100){

        }
        
        return tempCode

        
        
    })


    function changeOrder(){
        if (order === 'desc'){
            order = 'asc'
        }else if (order === 'asc'){
            order = 'desc'
        }
    }
    
    
</script>
<svelte:head>
    {#if animeData}
    <title>{animeData.title} on Soul Tv</title> 
    {/if}

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=My+Soul&family=Noto+Sans+Nag+Mundari:wght@400..700&family=Rubik:ital,wght@0,300..900;1,300..900&family=Ubuntu&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&family=Ubuntu&display=swap" rel="stylesheet">

</svelte:head>

    {#if animeData}
<div class='top-container'>
    <div class="right-info">

        <div class='right-right'>
            <img class='anime-poster' src="{animeData.image}" alt="{animeData.title}'s Poster"/>
        </div>

        <div class="right-left">
            <a href="/anime/{tempCode[2]}/watch/{animeData.episodes[0].id}" target="_self">
                <button class="watch-button">
                    WATCH NOW!
                </button>
            </a>
            <p class="synopsis">{animeData.synopsis}</p>
            <h1 class="title">{animeData.title}</h1>

        </div>
        
    </div>

    <div class="left-info">
            <p class="info"><strong>Japanese: </strong>{MALanime?.title_japanese || animeData.title }</p>
        <p class="info"><strong>Premiered: </strong>{MALanime?.year || animeData.premiered}</p>
        <p class="info"><strong>Status: </strong>{MALanime?.status || animeData.status}</p>      
        <p class="info"><strong>Total Episodes: </strong>{animeData.totalEpisodes}</p>  
        <p class="info"><strong>Type: </strong>{animeData.type}</p>  
        <p class="info"><strong>Rating: </strong>{MALanime?.score ? `${MALanime.score}/10` : 'N/A'}</p>  


              <div class="genres">
        {#each MALanime?.genres || [] as genre}
            
                <button class="genre-button">
                    {genre.name}
                </button>

        {/each}
        </div>

       

    </div>
   
</div>
<div class="The-bottom">

    <div class="recomendations">
        <h2 class="callRec">Recomendations</h2>
        <div class="card-box">
            {#each animeData.recommendations as recommendation}
                <Card title={recommendation.title} animeID={recommendation.id} poster={recommendation.image}></Card>
            {/each}
        </div>
    </div>




<div class="episodes">
    <div class="episodes-top">
        <h1 class="callEp">Episodes</h1>
        <button on:click={()=>changeOrder()} class="order">{order}  </button>
    </div>
    
    {#if order === 'asc'}

    <div class="small-episode-box-asc">
        {#each animeData.episodes as episode}
        <Episode episodeNum={episode.number}  episodeID={episode.id} animeID={animeData.id} filler={episode.isFiller} ></Episode>
    {/each}
    </div>

    {:else}

    <div class="small-episode-box-desc">
        {#each animeData.episodes as episode}
        <Episode episodeNum={episode.number}  episodeID={episode.id} animeID={animeData.id} filler={episode.isFiller} ></Episode>
    {/each}
    </div>

    {/if}
</div>
    

</div>



{/if}



 

<style>
    .top-container{
        padding-top: 100px;
        width: 100vw;
        display: flex;
        justify-content: space-between;
        align-items: center;

        gap:3vw

    }

    .right-info{
        display: flex;
        align-items: center;
        justify-content: start;
        gap: 5vw;

        width: 80vw;
    }

    .right-right{
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .title{
        color: white;
        font-family: "Noto Sans Nag Mundari", sans-serif;
        font-optical-sizing: auto;
        font-weight: 600;
        font-style: normal;
    }
    img{
        width: 15vw;
        height: 25h;
        padding-left: 2vw;

    }

    .right-left{
        display: flex;
        flex-direction:column-reverse;
        align-items: start;
        
        gap: 3vh;
    }


    .watch-button{
        width: 15vw;
        height: 7vh;
        border-radius: 1vh;

        background-color: #FF331F;
        border-color: #FF331F;

        color: white;
        font-size:x-large;
        font-weight: 1000;
    }

    .callEp{
        padding-left: 4vw;
        font-family: "Rubik", sans-serif;
        font-optical-sizing: auto;
        font-weight: 500;
        font-style: normal;
        color: #FF331F;

    }
    .watch-button:hover{
        border: 10px;
        border-color: #FF331F;
        color: #FF331F;
        background-color: #27272a;
    }
    .synopsis{
        color: white;
        font-family: "Noto Sans Nag Mundari", sans-serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
        width: 50vw;
        font-size: small;
    }

    .callRec{
        padding-left: 4vw;
        font-family: "Rubik", sans-serif;
        font-optical-sizing: auto;
        font-weight: 500;
        font-style: normal;
        color: #FF331F;
    }

    

    .left-info{
        width: 20vw;
        border-left: 10px;
        border-right: 0;
        border-top: 0;
        border-bottom: 0;

        border-color: #FF331F;
    }

    .info{
        color: white;
        font-family: "Noto Sans Nag Mundari", sans-serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
        font-size: small;
    }

    .genre-button{
        background-color: #FF331F;
        color: white;
        font-weight: 700;
        border: none;
        border-radius: 1vh;
    }
    .genre-button:hover{
        background-color: #27272a;
        color: white;

    }

    .The-bottom{
        width: 100vw;
        display: flex;
        flex-direction: row;

    }

    .recomendations{

        display: flex;
        flex-direction: column;
        justify-content: baseline;
        align-items: baseline;
        flex-wrap: wrap;
        
    }


    .small-episode-box-asc{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.3vw;
        overflow: auto;
        height: 40vh;
    }
    .small-episode-box-desc{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap-reverse;
        gap: 0.3vw;
        overflow: auto;
        height: 40vh;

    }
    .card-box{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 75vw;
    }
    .episodes{
        width: 25vw;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .episodes-top{
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        gap: 4vw;
        object-fit: fill;
        
    }

    .order{
        border: none;
        width: 3vw;
        height: 3vh;
        background-color: #FF331F;
        border: none;
        color: white;
        border-radius: 0.1vw;
    }

    @media(max-width: 1200px)  {
        .top-container{
            flex-direction: column;

    }

    .right-info{
        flex-direction: column;
    }
    .synopsis{
        width: 95vw;
    }
    img{
        width: 100%;
        height: 100%;
        padding-top: 50px;
    }
    .left-info{
        width: 90vw;
    }

    .watch-button{
        width: 70vw;
    }

    .The-bottom{
        flex-direction: column-reverse;
    }

    .small-episode-box-asc{
        width: 100;
        justify-content: center;
    }
    .small-episode-box-desc{
        width: 100;
        justify-content: center;

    }

    .episodes{
        width: 100vw;
        justify-content: center;
        align-items: center;
    }

    .order{
        width: 15vw;
    }
    }
</style>  