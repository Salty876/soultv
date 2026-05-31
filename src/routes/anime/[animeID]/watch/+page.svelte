<head>
    <script src="//cdn.jsdelivr.net/npm/hls.js@1"></script>
    <script type="module" src="https://cdn.jsdelivr.net/npm/hls-video-element@1.2/+esm"></script>
    
    <script type="module" src="https://cdn.jsdelivr.net/npm/media-chrome@3/+esm"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=My+Soul&family=Noto+Sans+Nag+Mundari:wght@400..700&family=Rubik:ital,wght@0,300..900;1,300..900&family=Ubuntu&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&family=Ubuntu&display=swap" rel="stylesheet">

</head>

<script>
import EpisodeBox from '../../../../../components/episode-box.svelte';
import Card from  '../../../../../components/show-card.svelte'

import { onMount } from 'svelte';



    let episodeCode
    let animeCode
    let anime
    let episodeLink
    let Url
    let currentEpisode


     onMount(async() => {
        
 
        // read episode from querystring so full URLs with slashes are preserved
        const params = new URLSearchParams(window.location.search || "");
        episodeCode = decodeURIComponent(params.get('episode') || "")
        animeCode = decodeURIComponent(window.location.pathname.split('/')[2] || "")
        console.log('episodeCode (from query):', episodeCode)
        
   

        const ret = await fetch(`/api/anime/${encodeURIComponent(animeCode)}`)
        const payload = await ret.json();
        anime = payload.animeData;

        const res = await fetch(`/api/anime/${encodeURIComponent(animeCode)}/watch/${encodeURIComponent(episodeCode)}`);
		    episodeLink = await res.json();
        console.log(anime)



        const all = anime.episodes.length
        let i = 0 
        while (i < all){
          if (anime.episodes[i].id === episodeCode){
            currentEpisode = i
          }

          i++
        }

        console.log(currentEpisode)



    Url = episodeLink.sources[0]?.url?.includes('.m3u8')
     ? "https://m3u8-proxy-cors-brown.vercel.app/cors?url=" + episodeLink.sources[0].url
     : episodeLink.sources[0]?.url

        console.log(Url)


        console.log("mounted")




    })
  


</script>
<svelte:head>
  {#if anime}
  <title>Watching Episode {currentEpisode+1} of {anime.title} on Soul Tv</title>
  {/if}
</svelte:head>

{#if episodeLink && anime && Url} 

<div class="main-thing">
  <div class="episode-name-wrapper">
    <!-- {#if currentEpisode} -->
    <h1 class="currentEpisde">Episode {currentEpisode+1}: {anime.episodes[currentEpisode].title}</h1>
    <!-- {/if} -->
  </div>
  <media-controller style="aspect-ratio: 16/9" >
    {#if Url && Url.includes('.m3u8')}
      <hls-video
        src={Url}
        slot="media"
        crossorigin
      >
      {#each episodeLink.subtitles as subs}
        {#if subs.lang != 'Thumbnails'}
          <track label={subs.lang} kind="subtitles" srclang="en" src={'https://corsproxy.io/?' + subs.url}>
        {:else}
          <track label="thumbnails" kind="metadata" src={'https://corsproxy.io/?' + subs.url}>
        {/if}
      {/each}
      </hls-video>
    {:else}
      <iframe src={Url} style="width:100%;height:70vh;border:0;" allowfullscreen loading="lazy"></iframe>
    {/if}
    <media-loading-indicator slot="centered-chrome" noautohide></media-loading-indicator>
    <media-control-bar>
      <media-play-button></media-play-button>
      <media-seek-backward-button></media-seek-backward-button>
      <media-seek-forward-button ></media-seek-forward-button>
      <media-mute-button></media-mute-button>
      <media-volume-range></media-volume-range>
      <media-time-range></media-time-range>
      <media-time-display showduration remaining></media-time-display>
      <media-playback-rate-button></media-playback-rate-button>
      <media-captions-menu hidden id="menu1" anchor="menu-button1"></media-captions-menu>
      <media-captions-menu-button id="menu-button1" invoketarget="menu1"></media-captions-menu-button>
      <media-fullscreen-button></media-fullscreen-button>
      <media-preview-thumbnail

  
  ></media-preview-thumbnail>
    </media-control-bar>
  </media-controller> 
  <div class="episode-wrapper">

  </div>
    <h1 class='announcement'>Episodes</h1>
  <div class="episodeBox">
    {#if anime.totalEpisodes < 150}
    {#each anime.episodes as episode}
        <EpisodeBox episodeNum={episode.number} filler = {episode.isFiller} animeID={animeCode} episodeID={episode.id}></EpisodeBox>
    {/each} 
    {:else}
    {#each anime.episodes.slice(currentEpisode,(currentEpisode+100)) as episode}
        <EpisodeBox episodeNum={episode.number} filler = {episode.isFiller} animeID={animeCode} episodeID={episode.id}></EpisodeBox>
    {/each} 
    {/if}
  </div>

  <div class="end">
    <div class="info">
      <img src="{anime.image}" alt="{anime.title}'s poster">
      <div class="Right-side">
        <h2 class="title">{anime.title}</h2>
        <p class="synopsis">{anime.description}</p>
        <h4 class="petty-info"><b>Type:</b> {anime.type}</h4>
        <h4 class="petty-info"><b>Total Episodes:</b> {anime.totalEpisodes}</h4>


      </div>

    </div>

    <div class="recs">
      <h2 class="announcement">More Like This</h2>
      <div class="cards">
        {#each anime.recommendations as recommendation}
          <Card animeID={recommendation.id} title={recommendation.title} poster={recommendation.image}></Card>
        {/each}
      </div>
    </div>
  </div>
</div>

{/if}

<style>


    .main-thing{
      padding-top: 7vh;
      width: 100vw;
      height: 100%;

      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .episode-name-wrapper{
      display: flex;
      flex-direction: row;
      width: 100vw;
    }

    .currentEpisde{
      padding-left: 2vw;
      font-family: "Rubik", sans-serif;
      font-optical-sizing: auto;
      font-weight: 500;
      font-style: normal;
      color: #FF331F;
    }
    media-controller{
        width: 100vw;
        height: 70vh;
        object-fit: contain;

    }



    .announcement{
        font-family: "Rubik", sans-serif;
        font-optical-sizing: auto;
        font-weight: 500;
        font-style: normal;
        color: #FF331F;
    }
    img{
      padding-left: 3vw;
      width: 25vw;
      height: 50h;
      object-fit: contain;
    }
    .episodeBox{
      width: 85vw;
      gap: 0.5vw;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
    .info{
      width: 60vw;
      height: 60vh;
      display: flex;
      flex-direction: row;
    }

    .title{
      color: white;
        font-family: "Noto Sans Nag Mundari", sans-serif;
        font-optical-sizing: auto;
        font-weight: 600;
        font-style: normal;
    }

    .synopsis{
      color: white;
        font-family: "Noto Sans Nag Mundari", sans-serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
        font-size: small;
    }

    .petty-info{
      color: white;
        font-family: "Noto Sans Nag Mundari", sans-serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
    }

    .cards{
      display: flex;
      flex-direction: row;
      overflow-x: auto;
    }
    .recs{
      width: 38vw;
      padding-left: 2vw;

    }
    .Right-side{
      display: flex;
      flex-direction: column;
      padding-left: 2vw;
    }

    .end{
      display: flex;
      width: 100vw;
      flex-direction: row;
      padding-top: 40px;
    }


    @media(max-width: 600px)  {

      media-controller{
        width: 90vw;
        height: 40vh;

      }
      media-control-bar{
      height: 5vh;
    }

      .currentEpisde{
        font-size: medium;
      }

      .end{
        flex-direction: column;
        gap: 10vh;
      }

      .info{
        width: 100vw;
        flex-direction: column;
      }

      .recs{
        padding-top: 50px;
        width: 100vw;
      }
      .cards{
        flex-direction: column;
        width: 100vw;
        align-items: center;
      }
      .announcement{
        padding-top: 100px;
      }
      .episodeBox{
        width: 100vw;
        justify-content: center;

          }
    }


</style>
