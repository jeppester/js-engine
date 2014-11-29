nameSpace = (name) ->
  i = undefined
  name = name.split(".")

  # Create namespace if missing
  i = 0
  while i < name.length

    # Create eval string
    str = name.slice(0, i + 1).join(".")
    eval str + " = {}"  if eval("window." + str) is undefined
    i++
  return
