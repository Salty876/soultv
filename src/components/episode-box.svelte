<script>
    export let episodeNum
    export let episodeID
    export let animeID
    export let filler
</script>

<!-- Use a query parameter for the episode so full URLs with slashes don't break routing -->
<a href={"/anime/" + animeID + "/watch?episode=" + encodeURIComponent(episodeID)}>
    {#if filler === true}

    <button class="episode-box-filler">
        <h5>{episodeNum}</h5>
        
    </button>
    {:else}
    <button class="episode-box-cannon">
        <h5>{episodeNum}</h5>
        
    </button>
    {/if}

</a>


<style>
    .episode-box-filler{
        width: 5vw;
        height: 4vh;

        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #3D0500;
        border: none;

        border-radius: 0.2vw;
        color: white;
    }

    .episode-box-cannon{
        width: 5vw;
        height: 4vh;

        display: flex;
        justify-content: center;
        align-items: center;

        background-color: #FF331F;
        border: none;
        border-radius: 0.2vw;
        color: white;
    }

    a{
        text-decoration: none;
    }

    @media(max-width: 600px) {
        .episode-box-cannon{
            width: 15vw;
        }

        .episode-box-filler{
            width: 15vw;
        }
    }
</style>