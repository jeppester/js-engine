mixin = (inheritorClass, inheritClass) ->
  functionName = undefined
  inheritorClass::inheritedClasses.push inheritClass
  Array::push.apply inheritorClass::inheritedClasses, inheritClass::inheritedClasses
  for functionName of inheritClass::
    inheritorClass::[functionName] = inheritClass::[functionName]  if typeof inheritClass::[functionName] is "function"  if inheritClass::hasOwnProperty(functionName)
  return
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
