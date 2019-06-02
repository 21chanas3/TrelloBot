const fuzzy = require("fuzzy");
const StickerEmojis = {
	thumbsup: "<:trelloThumbsUp:245756307456524299>",
	thumbsdown: "<:trelloThumbsDown:245756307452329984>",
	heart: "<:trelloHeart:245752268312281109>",
	star: "<:trelloStar:245756307578028034>",
	clock: "<:trelloClock:245758457100238848>",
	huh: "<:trelloHuh:245756306936299521>",
	rocketship: "<:trelloRocketship:245756307309592576>",
	warning: "<:trelloWarning:245758457171410945>",
	smile: "<:trelloSmile:245756307334889472>",
	laugh: "<:trelloLaugh:245756307221643274>",
	frown: "<:trelloFrown:322123093424209921>",
	check: "<:trelloCheck:245758456814895105>",

	"pete-alert": "<:trellopeteAlert:245758456840060941>",
	"pete-award": "<:trellopeteAward:245758457272205312>",
	"pete-broken": "<:trellopeteBroken:322128049669668864>",
	"pete-busy": "<:trellopeteBusy:322128049715937280>",
	"pete-completed": "<:trellopeteComplete:245758456999575553>",
	"pete-confused": "<:trellopeteConfused:322128049686708224>",
	"pete-ghost": "<:trellopeteGhost:322128049707417610>",
	"pete-happy": "<:trellopeteHappy:322128049678319616>",
	"pete-love": "<:trellopeteLove:322128049795497994>",
	"pete-music": "<:trellopeteMusic:322128049774526465>",
	"pete-shipped": "<:trellopeteShipped:322128050148081674>",
	"pete-sketch": "<:trellopeteSketch:322128049837703178>",
	"pete-space": "<:trellopeteSpace:322128050185568276>",
	"pete-talk": "<:trellopeteTalk:322128050231967744>",
	"pete-vacation": "<:trellopeteVacation:322128050042961921>",

	"taco-active": "<:trellotacoActive:322130958868545536>",
	"taco-alert": "<:trellotacoAlert:322130958675607553>",
	"taco-angry": "<:trellotacoAngry:322130959023603712>",
	"taco-celebrate": "<:trellotacoCelebrate:322130958834860034>",
	"taco-clean": "<:trellotacoClean:322130958692384770>",
	"taco-confused": "<:trellotacoConfused:322130959342370818>",
	"taco-cool": "<:trellotacoCool:322130959191375873>",
	"taco-embarrassed": "<:trellotacoEmbarrassed:322130959325593600>",
	"taco-love": "<:trellotacoLove:322144522752753665>",
	"taco-money": "<:trellotacoMoney:322130959145107467>",
	"taco-pixel": "<:trellotacoPixel:322130959363342336>",
	"taco-proto": "<:trellotacoProto:322130959468331008>",
	"taco-reading": "<:trellotacoReading:322130959313141771>",
	"taco-robot": "<:trellotacoRobot:322130959510142976>",
	"taco-sleeping": "<:trellotacoSleeping:322130959585509376>",
	"taco-trophy": "<:trellotacoTrophy:322130959967453194>"
}

const TrelloEvents = {
  voteOnCard: "a card is voted on",
  createCard: "a card is created",
  updateCheckItemStateOnCard: "a checklist item has been changed",
  deleteCard: "a card is deleted",
  commentCard: "a card is commented on",
  removeChecklistFromCard: "a checklist is added tn a card",
  addChecklistToCard: "a checklist is removed from a card",
  addLabelToCard: "a label is added to a card",
  removeLabelFromCard: "a label is removed from a card",
  updateCard: "a card has been edited, such as it's name and description",
  createCheckItem: "a check item has been added to a checklist",
  deleteCheckItem: "a check item has been removed to a checklist",
  addMemberToBoard: "a member has been added to the board",
  makeAdminOfBoard: "a member has been made admin",
  makeNormalMemberOfBoard: "a member has been made normal member",
  createList: "a list has been created",
  addAttachmentToCard: "an attachment has been added to a card"
}

module.exports = (client) => { 
  let Util = {
    StickerEmojis, TrelloEvents,
    layout: {
      cardLabels(labels) {
        return labels.map(label => "["+label.name+"]["+Util.capFirst(label.color)+"]")
      },
      cardLabelsEmbed(labels) {
        return labels.map(label => label.name + ", Color: " + Util.capFirst(label.color))
      },
      attachments(atchmts) {
        return atchmts.map(atchmt => atchmt.url)
      },
      members(members) {
        return members.map(member => member.fullName)
      },
      stickers(stickers) {
        var arr = []
        for(var a in stickers){
          if(!StickerEmojis[stickers[a].image]) return;
          arr.push(StickerEmojis[stickers[a].image])
        }
        var obj = { }
        for (var i = 0, j = arr.length; i < j; i++) {
           obj[arr[i]] = (obj[arr[i]] || 0) + 1;
        }
        var obj2 = []
        for (var emoji in obj) {
          amt = obj[emoji]
          obj2.push(emoji+' '+amt)
        }
        return obj2
      }
    },
    filter(text) {
      return text.toString().replace(client.apiKey("trellokey"), "🔑").replace(client.apiKey("trellotoken"), "🔶")
    },
    filterStatus(res) {
      return new Promise((resolve, reject) => {
        switch(res.status){
          case 404:
            reject("Not Found")
          break;
          case 400:
            reject("Bad Request")
          break;
          case 401:
            reject("Unauthorized")
          break;
          case 422:
            reject("Unprocessable Entity")
          break;
          case 419:
            reject("Ratelimited")
          break;
          case 200:
            resolve()
          break;
          case 500:
            reject("Server Error")
          break;
          default:
            reject("Unknown")
          break;
        }
      });
    },
    sendError(message, e) {
        message.channel.stopTyping();
        if (e.errorCode) return Util.sendWebError(message, e);
        client.log("Command Error:\n", e);
        message.channel.send(`Error! Report in the Support Server listed in \`${client.config.prefix}help\`!\n\`\`\`js\n${Util.filter(e.stack)}\`\`\``)
    },
    sendWebError(message, e) {
      switch(e.errorCode){
        case "err":
          console.log("Web Error:\n", e);
          message.channel.send(`There was an error processing that command! Report in the Support Server listed in \`${client.config.prefix}help\`!\n\`${Util.filter(e.err.text)}\``)
        break;
        case "statusfail":
          console.log("Web Status Fail:\n", e);
          message.channel.send(`I could not do that! \`${e.response.status}: ${e.errorText}\``)
        break;
        default:
          if(e.stack){
            message.channel.send(`Error! Report in the Support Server listed in \`${client.config.prefix}help\`!\n\`\`\`js\n${Util.filter(e.stack)}\`\`\``);
          }else{
            message.channel.send(`UNKNOWN ERR, CHECK CONSOLE`)
            console.log(e)
          }
        break;
      }
    },
    rInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    capFirst(str) {
      return str[0].toUpperCase() + str.slice(1);
    },
    checkPerm(user, server) {
      if(server.owner.user.id == user.id || client.config.elevated.includes(user.id)) return true;
      return server.member(user).roles.array().map(r => r.name.toLowerCase().startsWith('trello')).includes(true)
    },
    titleCase(str) {
      words = str.toLowerCase().split(' ');

      for(var i = 0; i < words.length; i++) {
            var letters = words[i].split('');
            letters[0] = letters[0].toUpperCase();
            words[i] = letters.join('');
      }
      return words.join(' ');
    },
    toHHMMSS(str) {
      var sec_num = parseInt(str, 10); // don't forget the second param
      var hours   = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);

      if (hours   < 10) {hours   = "0" + hours;}
      if (minutes < 10) {minutes = "0" + minutes;}
      if (seconds < 10) {seconds = "0" + seconds;}
      var time    = hours + ':' + minutes + ':' + seconds;
      return time;
    },
    splitArray(array, chunk) {
      let finalarray = [];
      let i,j,temparray;
      for (i=0,j=array.length; i<j; i+=chunk) {
        temparray = array.slice(i,i+chunk);
        finalarray.push(temparray);
      }
      return finalarray;
    },
    pageNumber(ipp, count, page = 1){
      let p = 1;
      let max = Math.ceil(count/ipp)
      if(Number(page)){
        p = Number(page);
        if(p < 1) p = 1;
        if(p > max) p = max;
      }
      return [p, max]
    },
    qSearch(items, item, key = 'name'){
      return fuzzy.filter(item, items, {
        extract: el => el[key]
      }).map(el => el.original);
    },
    keyValueForEach(obj, f) {
      Object.keys(obj).map(o => {
        f(o, obj[o]);
      });
    },
    async query(cxtMessage, items, query, key = undefined, displayItem = undefined, promptText = undefined) {
      let results = Util.qSearch(items, query, key)
      let result = null
      if(results.length == 1)
        result = results[0];
        else if(results.length > 1) {
          let promptResult = await client.prompt(cxtMessage, results, displayItem, promptText)
          if(promptResult === null) return { quit: true };
          result = promptResult;
        }
      return { results, result }
    }
  }
  return Util
};