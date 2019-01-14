BRANCH_NAME=$1
#test

cd repository
git fetch origin dev
git checkout dev
git merge --no-edit --no-ff $BRANCH_NAME
git push origin dev
