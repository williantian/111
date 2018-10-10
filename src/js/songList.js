{
    let view = {
        el: '#songList-container',
        template: `
        <ol class="songList">
            </ol>
        `,
        render(data){
            let $el = $(this.el)
            $el.html(this.template)
            let {songs}=data
            let liList = songs.map((song)=>{
                let li = $('<li></li>') 
                li.text(song.name).attr('data-song-id',song.id)
                return li //return 之后 liList 才有值 不然就是undefined
            })
        //可以简化为 let liList = songs.map((song)=>{
           //       let li = $('<li></li>') 
            //      li.text(song.name)
            //      return li})
            //由于只有一行 map可以简化为
            // let liList = songs.map((song)=> $('<li></li>').text(song.name)
            
            $el.find('ol').empty()
            liList.map((domLi)=>{
                $el.find('ol').append(domLi)
            })
        },
        clearActive(){
            $(this.el).find('.active').removeClass('active')
        },
        activeItem(li){
            let $li = $(li)
            $li.addClass('active').siblings('.active').removeClass('active')
        }
    }
    let model = {
        data: {
            songs: []
        },
        find(){
            var query = new AV.Query('Song');
            return query.find().then((songs)=> {//返回一个promise对象 才能接then()函数
                   this.data.songs = songs.map((song)=> {
                    return {id: song.id, ...song.attributes}
                  })
                   return songs//返回一个promise对象 才能接then()函数
            })                 //这是一个promise链
        }
    }
    let controller = {
        init(view,model){
            this.view=view
            this.model=model
            this.view.render(this.model.data)
            this.bindEventHub()
            this.bindEvents()
            this.getAllSongs()
            
            
        },
        getAllSongs(){
            return this.model.find().then(()=>{
                   this.view.render(this.model.data)
                })
        },
        bindEvents(){
            $(this.view.el).on('click', 'li', (e)=>{
                 this.view.activeItem(e.currentTarget)
                 let songId = e.currentTarget.getAttribute(`data-song-id`)
                 let data
                 let songs = this.model.data.songs
                 for(let i=0; i<songs.length; i++){
                     if(songs[i].id === songId){
                         data = songs[i]
                         break
                     }
                 }
                 let object = JSON.parse(JSON.stringify(data))
                 
                 window.eventHub.emit('select', object)
            })
        },
        bindEventHub(){
            window.eventHub.on('upload',()=>{
                this.view.clearActive()
            })
            window.eventHub.on('create', (songData)=>{
                this.model.data.songs.push(songData)
                this.view.render(this.model.data)
            })
        }
    
    }
    controller.init(view,model)
}