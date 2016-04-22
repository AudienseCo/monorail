BRANCH_NAME=$1

cd repository
git fetch origin master
git checkout master
git merge --no-edit --no-ff $BRANCH_NAME
git push origin master
