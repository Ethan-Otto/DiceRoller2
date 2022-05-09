
function decode(code){
  const roll_dict = {};
  var code = code.trim()
  var start = code.slice(0,2)
  if (start != '/r'){
    throw Error("Incorrect starting symbol")
  }
  var code = code.trim().slice(2)
  const dice = code.trim().split("+")
  console.log(dice)
  dice.forEach(e => {
    var splits = e.split("d")
    num = splits[0]
    face = splits[1]
    
    if (num == ""){
      num = 1
    }
    roll_dict[parseInt(face)] = parseInt(num)
  });
  console.log(roll_dict)
  return roll_dict

}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sum_roll(roll_dict){
  total = 0
  for (var face in roll_dict) {
    
    if (roll_dict.hasOwnProperty(face)) {
      num = roll_dict[face]
      
      for (let i = 0; i < num; i++) {
        total += getRandomInt(1,parseInt(face))
      } 
    }
  }
  return total
}

function decodeSum(code){
  return sum_roll(decode(code))
}
