<template>
	<el-container>
		<!-- <el-header>Header</el-header> -->
		<el-main>
			<div class="flex_start mb10">
				<el-input placeholder="请输入搜索关键字" clearable v-model="tableSet.keywords" class="search-ipt">
					<el-button slot="append" icon="el-icon-search" @click="search"></el-button>
				</el-input>
				<el-button type="warning" @click="showAll" class="ml10">显示全部</el-button>
				<el-button type="primary" @click="showDialog">添加商家</el-button>
			</div>
			<el-table :data="tableData" v-loading="tableSet.loading" stripe style="width: 100%">
				<el-table-column prop="companyName" label="商家名称">
				</el-table-column>
				<el-table-column prop="passwd" label="密码">
				</el-table-column>
				<el-table-column prop="phone" label="联系方式">
				</el-table-column>
				<el-table-column label="状态">
					<template slot-scope="scope">
						<el-switch v-model="scope.row.status" :disabled="scope.row.loading" active-color="#13ce66" inactive-color="#ff4949" :active-value="1"
						 :inactive-value="0" @change="handleChange(scope.$index, scope.row)">
						</el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
						<el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="handleDelete(scope.$index, scope.row)">
							<el-button size="mini" type="danger" slot="reference">删除</el-button>
						</el-popconfirm>
					</template>
				</el-table-column>
			</el-table>
			<div class="flex_center mt20">
				<el-pagination background :hide-on-single-page="tableSet.pageSize > tableSet.count" @current-change="handleCurrentChange"
				 :current-page="tableSet.currentPage" :page-size="tableSet.pageSize" layout="total, prev, pager, next, jumper"
				 :total="tableSet.count">
				</el-pagination>
			</div>
			<el-dialog title="添加/编辑商家" :visible.sync="dialogVisible" width="30%" :close-on-click-modal="false" :show-close="false">
				<el-form ref="form" :model="form" :rules="rules" label-width="80px">
					<el-form-item label="商家名称" prop="companyName">
						<el-input v-model="form.companyName" :maxlength="30" placeholder="请输入商家名称"></el-input>
					</el-form-item>
					<el-form-item label="登录密码">
						<el-input v-model="form.passwd" show-password :maxlength="20" placeholder="请输入密码"></el-input>
					</el-form-item>
					<el-form-item label="手机号" prop="phone">
						<el-input v-model="form.phone" :maxlength="15" placeholder="请输入手机号"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="resetForm('form')">取 消</el-button>
					<el-button type="primary" @click="submitForm('form')">确 定</el-button>
				</span>
			</el-dialog>
		</el-main>
	</el-container>

</template>

<script>
	import {
		getList,
		saveCg,
		delCg,
		changeCg
	} from '@/api/supply';
	export default {
		name: 'SupplysList',
		data() {
			var validatePhone = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('请输入手机号'));
				} else if (!(/^1[3456789]\d{9}$/.test(value))) {
					callback(new Error('手机号格式错误'));
				} else {
					callback();
				}
			};
			return {
				tableSet: {
					loading: false,
					pageSize: 10,
					count: 100,
					currentPage: 1,
					keywords: ''
				},
				tableData: [],
				index: '',
				dialogVisible: false,
				form: {
					companyName: '',
					passwd: '',
					phone: ''
				},
				rules: {
					companyName: [{
						required: true,
						message: '商家名称不能为空',
						trigger: 'blur'
					}],
					phone: [{
						required: true,
						validator: validatePhone,
						trigger: 'blur'
					}]
				}
			}
		},
		created() {
			this.getData()
		},
		methods: {
			// 获取列表数据
			getData() {
				let self = this,
					set = this.tableSet;
				let data = {
					page: set.currentPage,
					limit: set.pageSize,
					keywords: set.keywords
				}
				set.loading = true;
				getList(data).then(res => {
					set.loading = false;
					if(res.result.list.length > 0) {
						res.result.list.forEach(item => {
							item["loading"] = false;
						})
					}
					self.tableData = res.result.list;
					set.count = res.result.count;
				})
			},

			// 搜索
			search() {
				this.tableSet.currentPage = 1;
				this.getData();
			},
			// 显示全部
			showAll() {
				this.tableSet.keywords = "";
				this.search();
			},

			// 分页
			handleCurrentChange(page) {
				this.tableSet.currentPage = page;
				this.getData();
			},
			
			// 更改状态
			handleChange(index, row) {
				let self = this;
				let data = {
					id: row.id,
					ChangeField: 'status',
					ChangeValue: String(row.status)
				}
				row.loading = true;
				changeCg(data).then(res => {
					row.loading = false;
					self.$message({
						message: '操作成功',
						type: 'success',
						center: true
					});
				})
			},
			
			// 编辑
			handleEdit(index, row) {
				this.index = index;
				this.form = Object.assign({}, row);
				this.dialogVisible = true;
			},
			// 删除
			handleDelete(index, row) {
				console.log(index, row)
				let self = this;
				delCg({
					id: row.id
				}).then(res => {
					self.$message({
						message: '删除成功',
						type: 'success',
						center: true
					});
					self.tableData.splice(index, 1);
					self.tableSet.count --;
				})
			},

			// 显示添加弹框
			showDialog() {
				this.form = {
					companyName: "",
					passwd: '',
					phone: ""
				}
				this.dialogVisible = true;
			},
			// 重置表单信息
			resetForm(formName) {
				this.dialogVisible = false;
				this.$refs[formName].resetFields();
			},
			// 提交表单
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						this.saveForm(formName);
					} else {
						console.log('验证失败');
						return false;
					}
				});
			},
			saveForm(formName) {
				let self = this;
				let data = {
					company_name: this.form.companyName,
					phone: this.form.phone
				}
				if (this.form.hasOwnProperty('id')) {
					data.id = this.form.id;
				}
				saveCg(data).then(res => {
					self.dialogVisible = false;
					self.$message({
						message: '信息提交成功',
						type: 'success',
						center: true
					});
					// 重置
					self.$refs[formName].resetFields();
					if (data.hasOwnProperty('id')) {
						self.getData();
					} else {
						self.showAll();
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.search-ipt {
		width: 300px;
	}
</style>
