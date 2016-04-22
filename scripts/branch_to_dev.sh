BRANCH_NAME=$1

cd repository
git fetch origin dev
git checkout dev
git merge --no-edit --no-ff $BRANCH_NAME
git push origin dev
