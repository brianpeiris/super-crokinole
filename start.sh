pushd server > /dev/null
echo starting server
pipenv run python src/main.py &
popd > /dev/null

pushd client > /dev/null
echo starting client
npm start &
popd > /dev/null

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

wait
